import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                <span className="font-bold">DN</span>
              </div>
              <span className="font-bold">Dragão Negro</span>
            </div>
            <p className="text-stone-300 text-sm">
              Templo de Kimbanda dedicado ao poder espiritual e práticas tradicionais.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <div className="space-y-2 text-sm">
              <Link href="/sobre" className="block hover:text-amber-400 transition">Sobre Nós</Link>
              <Link href="/obra" className="block hover:text-amber-400 transition">Trabalhos</Link>
              <Link href="/blog" className="block hover:text-amber-400 transition">Blog</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Serviços</h4>
            <div className="space-y-2 text-sm">
              <Link href="/consulta-exu" className="block hover:text-amber-400 transition">Agendamento</Link>
              <Link href="/obra" className="block hover:text-amber-400 transition">Trabalhos</Link>
              <Link href="/loja" className="block hover:text-amber-400 transition">Loja</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <div className="space-y-2 text-sm text-stone-300">
              <p>São Paulo - SP</p>
              <p>(11) 99999-9999</p>
              <p>contato@dragaonegro.com.br</p>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-700 mt-8 pt-8 text-center text-sm text-stone-400">
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="/privacidade" className="hover:text-amber-400 transition">Privacidade</Link>
            <Link href="/termos" className="hover:text-amber-400 transition">Termos</Link>
          </div>
          <p>&copy; 2025 Templo de Kimbanda Dragão Negro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}