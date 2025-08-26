'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Shield, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Dragão Negro</h1>
              <p className="text-xs text-stone-600">Templo de Kimbanda</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-stone-700 hover:text-red-700 transition-colors">
              Início
            </Link>
            <Link href="/sobre" className="text-stone-700 hover:text-red-700 transition-colors">
              Sobre
            </Link>
            <Link href="/trabalhos" className="text-stone-700 hover:text-red-700 transition-colors">
              Trabalhos
            </Link>
            <Link href="/blog" className="text-stone-700 hover:text-red-700 transition-colors">
              Blog
            </Link>
            <Link href="/loja" className="text-stone-700 hover:text-red-700 transition-colors">
              Loja
            </Link>
            <Link href="/contato" className="text-stone-700 hover:text-red-700 transition-colors">
              Contato
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/membros/login" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Área do Membro
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
              <a 
                href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma consulta no Templo Dragão Negro." 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button asChild className="bg-red-700 hover:bg-red-800">
              <Link href="/agendamento">Agendar Consulta</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-stone-700 hover:text-red-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/sobre" 
                className="text-stone-700 hover:text-red-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                href="/trabalhos" 
                className="text-stone-700 hover:text-red-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Trabalhos
              </Link>
              <Link 
                href="/blog" 
                className="text-stone-700 hover:text-red-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/loja" 
                className="text-stone-700 hover:text-red-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Loja
              </Link>
              <Link 
                href="/contato" 
                className="text-stone-700 hover:text-red-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <div className="border-t border-stone-200 pt-4 space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link href="/membros/login" onClick={() => setIsMenuOpen(false)}>
                    <Users className="mr-2 h-4 w-4" />
                    Área do Membro
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-700 justify-start">
                  <a 
                    href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma consulta no Templo Dragão Negro." 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild className="w-full bg-red-700 hover:bg-red-800 justify-start">
                  <Link href="/agendamento" onClick={() => setIsMenuOpen(false)}>
                    Agendar Consulta
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}