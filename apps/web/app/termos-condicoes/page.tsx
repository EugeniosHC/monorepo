import { Typography } from "@eugenios/ui/components/ui/Typography";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import PageSection from "@/components/PageSection";

export const metadata: Metadata = {
  title: "Termos e Condições | Eugénios Health Club",
  description:
    "Termos e condições de utilização dos serviços do Eugénios Health Club. Conheça os seus direitos e deveres como membro.",
  robots: "index, follow",
};

export default function TermosCondicoesPage() {
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
              Termos e Condições
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
                1. Informações Gerais
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                Estes Termos e Condições regem a utilização dos serviços do Eugénios Health Club e constituem um acordo
                legal entre o utilizador e a nossa empresa. Ao utilizar os nossos serviços, aceita integralmente estes
                termos.
              </Typography>
            </section>

            {/* Services */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                2. Serviços Oferecidos
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                O Eugénios Health Club oferece os seguintes serviços:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Acesso às instalações do ginásio e equipamentos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Aulas de grupo e treino personalizado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Consultas de nutrição e wellness</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Serviços de spa e relaxamento</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Programas de fitness e saúde</span>
                </li>
              </ul>
            </section>

            {/* Membership */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                3. Adesão e Condições de Utilização
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Para se tornar membro do Eugénios Health Club, deve:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Ter pelo menos 18 anos de idade ou autorização dos pais/tutores</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Fornecer informações verdadeiras e atualizadas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Apresentar certificado médico de aptidão física</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Efetuar o pagamento das mensalidades conforme acordado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Respeitar as regras e regulamentos do clube</span>
                </li>
              </ul>
            </section>

            {/* Payments */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                4. Pagamentos e Faturação
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                As condições de pagamento são as seguintes:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Os pagamentos devem ser efetuados até ao dia 5 de cada mês</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Em caso de atraso, poderá ser aplicada uma taxa de mora</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>A falta de pagamento pode resultar na suspensão dos serviços</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Os preços podem ser alterados mediante aviso prévio de 30 dias</span>
                </li>
              </ul>
            </section>

            {/* Rules */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                5. Regras de Utilização
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Todos os membros devem:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Respeitar outros membros e funcionários</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Utilizar equipamentos adequadamente e com segurança</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Manter a higiene pessoal e das instalações</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Usar vestuário e calçado apropriado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Não fumar nas instalações</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Seguir as instruções dos funcionários</span>
                </li>
              </ul>
            </section>

            {/* Cancellation */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                6. Cancelamento e Reembolsos
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Condições para cancelamento:
              </Typography>
              <ul className="space-y-3 text-gray-700 ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Cancelamento deve ser solicitado por escrito com 30 dias de antecedência</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Não há reembolso de mensalidades já pagas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">•</span>
                  <span>Exceções podem ser consideradas por motivos de saúde ou mudança de residência</span>
                </li>
              </ul>
            </section>

            {/* Liability */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                7. Responsabilidade e Seguros
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                O Eugénios Health Club mantém seguros adequados para as suas instalações e atividades. No entanto, cada
                membro é responsável pela sua própria segurança e deve exercitar-se dentro dos seus limites físicos.
                Recomendamos consulta médica antes de iniciar qualquer programa de exercícios.
              </Typography>
            </section>

            {/* Privacy */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                8. Privacidade e Proteção de Dados
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                A recolha e tratamento de dados pessoais é regulamentada pela nossa{" "}
                <Link href="/politica-privacidade" className="text-primary hover:underline font-medium">
                  Política de Privacidade
                </Link>
                , em conformidade com o RGPD.
              </Typography>
            </section>

            {/* Modifications */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                9. Alterações aos Termos
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos e condições a qualquer momento. As alterações serão
                comunicadas através do nosso website ou por email, com pelo menos 30 dias de antecedência.
              </Typography>
            </section>

            {/* Contact */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                10. Contacto
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed mb-6">
                Para questões relacionadas com estes termos e condições, contacte-nos:
              </Typography>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="space-y-2">
                  <Typography as="p" variant="body" className="text-gray-700">
                    <strong>Email:</strong> info@eugenioshc.pt
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

            {/* Governing Law */}
            <section>
              <Typography as="h2" variant="title" className="text-primary mb-6">
                11. Lei Aplicável
              </Typography>
              <Typography as="p" variant="body" className="text-gray-700 leading-relaxed">
                Estes termos e condições são regidos pela lei portuguesa. Qualquer litígio será submetido à jurisdição
                dos tribunais portugueses.
              </Typography>
            </section>
          </div>
        </PageSection>
      </main>
    </div>
  );
}
