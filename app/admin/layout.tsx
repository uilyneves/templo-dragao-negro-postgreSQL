'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser, clearCorruptedSession } from '@/lib/supabase-browser';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!supabaseBrowser) {
        router.push('/login');
        return;
      }

      // Verificar sessão primeiro
      const { data: { session }, error: sessionError } = await supabaseBrowser.auth.getSession();
      
      if (sessionError || !session) {
        await clearCorruptedSession();
        router.push('/login');
        return;
      }

      // Verificar usuário
      const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
      
      if (userError || !user) {
        await clearCorruptedSession();
        router.push('/login');
        return;
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabaseBrowser
        .from('profiles')
        .select(`
          *,
          roles(name, display_name, level)
        `)
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Perfil não encontrado:', profileError);
        router.push('/login');
        return;
      }

      // Verificar se é admin
      const roleName = profile.roles?.name;
      if (!roleName || !['super_admin', 'admin'].includes(roleName)) {
        console.error('Usuário não é admin:', roleName);
        router.push('/login');
        return;
      }

      setUser({ ...user, profile });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      await clearCorruptedSession();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (supabaseBrowser) {
        await supabaseBrowser.auth.signOut();
      }
      router.push('/');
    } catch (error) {
      console.error('Erro no logout:', error);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <AdminHeader 
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}