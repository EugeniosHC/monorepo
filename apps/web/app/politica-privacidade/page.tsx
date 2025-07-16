import { Typography } from "@eugenios/ui/components/ui/Typography";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import PageSection from "@/components/PageSection";

export const metadata: Metadata = {
  title: "Política de Privacidade | Eugénios Health Club",
  description:
    "Política de privacidade e proteção de dados do Eugénios Health Club. Saiba como tratamos e protegemos os seus dados pessoais.",
  robots: "index, follow",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-layout py-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao início
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-white">
        <PageSection className="py-16 md:py-24">
          {/* Title */}
          <div className="text-center mb-16">
            <Typography as="h1" variant="sectionTitle" className="text-primary mb-4">
              Política de Privacidade
            </Typography>
            <Typography as="p" variant="body" className="text-gray-600">
              Última atualização: Janeiro 2025
            </Typography>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                1. Introdução
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                O Eugénios Health Club compromete-se a proteger a privacidade e os dados pessoais dos nossos clientes e
                utilizadores. Esta Política de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos
                as suas informações pessoais de acordo com o Regulamento Geral sobre a Proteção de Dados (RGPD).
              </Typography>
            </section>

            {/* Data Collection */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                2. Dados que Recolhemos
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Podemos recolher os seguintes tipos de dados pessoais:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Nome completo e dados de contacto (email, telefone)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Informações de saúde e fitness (quando fornecidas voluntariamente)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Dados de utilização do website e aplicações</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Informações de pagamento e faturação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Fotografias e imagens (quando autorizadas)</span>
                </li>
              </ul>
            </section>

            {/* Data Usage */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                3. Como Utilizamos os Seus Dados
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Utilizamos os seus dados pessoais para:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Prestar os nossos serviços e gerir a sua associação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Processar pagamentos e gerir faturação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Comunicar consigo sobre os nossos serviços</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Enviar informações sobre promoções e eventos (com o seu consentimento)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Melhorar os nossos serviços e experiência do utilizador</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Cumprir obrigações legais e regulamentares</span>
                </li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                4. Armazenamento e Segurança
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                Os seus dados são armazenados em servidores seguros e protegidos por medidas de segurança técnicas e
                organizacionais adequadas. Mantemos os seus dados apenas pelo tempo necessário para cumprir os fins para
                os quais foram recolhidos ou conforme exigido por lei.
              </Typography>
            </section>

            {/* Data Sharing */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                5. Partilha de Dados
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                Não vendemos, alugamos ou cedemos os seus dados pessoais a terceiros. Podemos partilhar dados apenas
                quando necessário para prestar os nossos serviços (por exemplo, com processadores de pagamento) ou
                quando exigido por lei.
              </Typography>
            </section>

            {/* User Rights */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                6. Os Seus Direitos
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Tem o direito de:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Aceder aos seus dados pessoais</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Retificar dados incorretos ou incompletos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Solicitar a eliminação dos seus dados</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Retirar o consentimento a qualquer momento</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Apresentar queixa à autoridade de proteção de dados</span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                7. Contacto
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Para exercer os seus direitos ou esclarecer dúvidas sobre esta política, contacte-nos através de:
              </Typography>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="space-y-2">
                  <Typography as="p" variant="body" className="text-gray-700">
                    <strong>Email:</strong> privacidade@eugenioshc.pt
                  </Typography>
                  <Typography as="p" variant="body" className="text-gray-700">
                    <strong>Telefone:</strong> +351 234 567 890
                  </Typography>
                  <Typography as="p" variant="body" className="text-gray-700">
                    <strong>Morada:</strong> Rua Principal, nº 123, 1234-567 Lisboa
                  </Typography>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                8. Alterações à Política
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de atualizar esta Política de Privacidade periodicamente. Qualquer alteração
                será comunicada através do nosso website ou por email.
              </Typography>
            </section>
          </div>
        </PageSection>
      </main>
    </div>
  );
}
