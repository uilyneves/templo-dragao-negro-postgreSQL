'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Heart, 
  Calendar, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Shield,
  Archive,
  DollarSign,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Visão geral do sistema'
  },
  {
    title: 'Membros',
    href: '/admin/membros',
    icon: Users,
    description: 'Gestão de membros'
  },
  {
    title: 'Consultas',
    href: '/admin/consultas',
    icon: Heart,
    description: 'Agendamentos e consultas'
  },
  {
    title: 'Rituais',
    href: '/admin/rituais',
    icon: Calendar,
    description: 'Eventos e rituais'
  },
  {
    title: 'Produtos',
    href: '/admin/produtos',
    icon: Package,
    description: 'Catálogo de produtos'
  },
  {
    title: 'Estoque',
    href: '/admin/estoque',
    icon: Archive,
    description: 'Controle de estoque'
  },
  {
    title: 'Financeiro',
    href: '/admin/financeiro',
    icon: DollarSign,
    description: 'Gestão financeira'
  },
  {
    title: 'Mensagens',
    href: '/admin/mensagens',
    icon: MessageSquare,
    description: 'Sistema de mensagens'
  },
  {
    title: 'Blog',
    href: '/admin/blog',
    icon: BookOpen,
    description: 'Gestão do blog'
  },
  {
    title: 'Entidades',
    href: '/admin/cargos-entidades',
    icon: Sparkles,
    description: 'Cargos e entidades espirituais'
  },
  {
    title: 'Relatórios',
    href: '/admin/relatorios',
    icon: FileText,
    description: 'Relatórios e analytics'
  },
  {
    title: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
    description: 'Configurações do sistema'
  }
];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-all duration-300
        ${isOpen ? 'w-64' : 'w-16'}
      `}>
        {/* Logo e Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-sm">Dragão Negro</h2>
                  <p className="text-xs text-stone-600">Painel Admin</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700"
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {/* Link para o site */}
          <Link href="/" className="block">
            <div className={`
              flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors
              ${!isOpen ? 'justify-center' : ''}
            `}>
              <Home className="h-5 w-5 flex-shrink-0" />
              {isOpen && (
                <div>
                  <span className="font-medium text-sm">Ver Site</span>
                  <p className="text-xs text-gray-500">Voltar ao site público</p>
                </div>
              )}
            </div>
          </Link>

          {/* Separador */}
          <div className="border-t border-gray-200 my-2" />

          {/* Menu Items */}
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${!isOpen ? 'justify-center' : ''}
                `}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && (
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{item.title}</span>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                  )}
                  {isActive && isOpen && (
                    <Badge className="bg-red-600 text-white text-xs">Ativo</Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer do Sidebar */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-xs text-gray-500">Templo de Kimbanda</p>
              <p className="text-xs font-medium text-red-700">Dragão Negro</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}