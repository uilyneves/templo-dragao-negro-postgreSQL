'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function MemberLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabaseBrowser) {
        setError('Supabase não configurado');
        return;
      }

      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Email ou senha incorretos');
        return;
      }

      if (data.user) {
        // Verificar se é membro
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          // Buscar role separadamente se necessário
          let roleName = null;
          if (profile.role_id) {
            const { data: role } = await supabaseBrowser
              .from('roles')
              .select('name')
              .eq('id', profile.role_id)
              .single();
            roleName = role?.name;
          }
          
          if (roleName === 'member') {
            router.push('/membros/dashboard');
          } else {
            setError('Acesso negado. Esta área é apenas para membros do templo.');
          }
        } else {
          setError('Perfil não encontrado.');
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-red-900 to-stone-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Button asChild variant="ghost" className="absolute top-4 left-4 text-white hover:text-amber-400">
              <Link href="/" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Site
              </Link>
            </Button>
          </div>
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="h-10 w-10 text-red-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-stone-900">
            Área do Membro
          </CardTitle>
          <CardDescription>
            Templo de Kimbanda Dragão Negro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-red-700 hover:bg-red-800"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar na Área do Membro'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <h4 className="font-medium text-stone-900 mb-2">Não tem acesso?</h4>
            <p className="text-sm text-stone-600 mb-3">
              Entre em contato conosco para solicitar acesso à área de membros.
            </p>
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a 
                  href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar acesso à área de membros do Templo Dragão Negro." 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/contato">
                  <Mail className="mr-2 h-4 w-4" />
                  Contato
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}