"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Termos de Uso
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Última atualização: 25 de janeiro de 2026
                </p>
              </div>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Bem-vindo ao <strong>Vendinhas.app</strong>! Estes{" "}
                <strong>Termos de Uso</strong> (&quot;Termos&quot;) regem o seu
                acesso e uso do nosso aplicativo web, projetado para ajudar{" "}
                <strong>
                  consultores de marcas de cosméticos e produtos de beleza
                </strong>{" "}
                a gerenciarem <strong>vendas</strong>, <strong>estoque</strong> e{" "}
                <strong>pedidos</strong> de forma simples e eficiente. Ao acessar
                ou usar o <strong>Vendinhas.app</strong>, você concorda em
                cumprir estes Termos.{" "}
                <strong>
                  Se você não concordar com qualquer parte destes Termos, não
                  use o serviço.
                </strong>
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                1. Elegibilidade
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Você deve ter pelo menos <strong>18 anos de idade</strong> ou a{" "}
                <strong>maioridade legal</strong> em sua jurisdição para usar o{" "}
                <strong>Vendinhas.app</strong>. Ao se registrar, você declara que
                atende a esses requisitos.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                2. Registro de Conta
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Para acessar certas funcionalidades, como gerenciamento de
                estoque, registro de pedidos e administração de vendas, você
                precisará <strong>criar uma conta</strong>. Você é responsável
                por fornecer{" "}
                <strong>informações precisas, atualizadas e completas</strong>{" "}
                durante o registro. <strong>Mantenha sua senha confidencial</strong>{" "}
                e notifique-nos imediatamente sobre qualquer{" "}
                <strong>uso não autorizado</strong> de sua conta. Nós nos
                reservamos o direito de{" "}
                <strong>suspender ou encerrar contas</strong> que violem estes
                Termos.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                3. Uso do Serviço
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                O <strong>Vendinhas.app</strong> permite que você:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <li>
                  Controle <strong>produtos em estoque</strong>.
                </li>
                <li>
                  Registre <strong>solicitações de produtos</strong> a
                  fornecedores.
                </li>
                <li>
                  Cadastre <strong>pedidos de clientes</strong>, verifique{" "}
                  <strong>disponibilidade em estoque</strong> e liste itens para
                  inclusão em pedidos a fornecedores.
                </li>
                <li>
                  Administre <strong>vendas</strong>, <strong>compras</strong>,{" "}
                  <strong>custos operacionais</strong> e <strong>relatórios</strong>{" "}
                  relacionados.
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Você concorda em usar o serviço apenas para{" "}
                <strong>fins legais</strong> e de acordo com estes Termos.{" "}
                <strong>Não use</strong> o Vendinhas.app para:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>
                  Atividades <strong>ilegais</strong>,{" "}
                  <strong>fraudulentas</strong> ou <strong>maliciosas</strong>.
                </li>
                <li>
                  Enviar <strong>spam</strong>, <strong>vírus</strong> ou
                  qualquer conteúdo prejudicial.
                </li>
                <li>
                  Violar <strong>direitos de propriedade intelectual</strong> de
                  terceiros.
                </li>
                <li>
                  <strong>Interferir no funcionamento</strong> do serviço ou
                  sobrecarregar nossos servidores.
                </li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                4. Propriedade Intelectual
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Todo o <strong>conteúdo</strong>, <strong>software</strong>,{" "}
                <strong>design</strong> e <strong>funcionalidades</strong> do
                Vendinhas.app são de <strong>propriedade exclusiva</strong> da
                nossa empresa ou de nossos licenciadores. Você recebe uma{" "}
                <strong>licença limitada, não exclusiva e revogável</strong> para
                usar o serviço para fins pessoais ou comerciais relacionados ao
                seu negócio de consultoria.{" "}
                <strong>
                  Você não pode copiar, modificar, distribuir ou criar obras
                  derivadas
                </strong>{" "}
                sem nossa permissão escrita.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                5. Dados do Usuário
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Você é responsável pelos dados</strong> que insere no
                Vendinhas.app, incluindo informações sobre estoque, pedidos e
                clientes. Certifique-se de que esses dados sejam{" "}
                <strong>precisos</strong> e não violem{" "}
                <strong>leis de privacidade</strong> ou direitos de terceiros.{" "}
                <strong>Nós não somos responsáveis</strong> por erros ou perdas
                decorrentes de dados incorretos fornecidos por você.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                6. Pagamentos e Assinaturas
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Se aplicável, certas funcionalidades podem exigir{" "}
                <strong>pagamento</strong>. Você concorda em pagar{" "}
                <strong>todas as taxas devidas</strong> e autoriza-nos a cobrar
                seu método de pagamento.{" "}
                <strong>Taxas não são reembolsáveis</strong>, exceto conforme
                exigido por lei.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                7. Encerramento
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Podemos <strong>suspender ou encerrar sua conta</strong> a
                qualquer momento, <strong>com ou sem aviso</strong>, se você
                violar estes Termos ou por qualquer outro motivo. Ao encerrar sua
                conta, você <strong>perderá acesso aos dados</strong> armazenados
                na plataforma. Recomendamos que{" "}
                <strong>exporte seus dados antes do encerramento</strong>,
                conforme opções disponíveis na conta ou solicitando via suporte.{" "}
                <strong>Não seremos responsáveis</strong> por perdas decorrentes
                de dados não exportados, exceto em casos de{" "}
                <strong>negligência</strong> ou{" "}
                <strong>violação comprovada</strong> por nossa parte.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                8. Isenção de Garantias
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                O Vendinhas.app é fornecido <strong>&quot;como está&quot;</strong>,
                sem garantias de qualquer tipo, expressas ou implícitas,
                incluindo precisão, disponibilidade ou adequação para um
                propósito específico. <strong>Não garantimos</strong> que o
                serviço esteja livre de erros ou interrupções.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                9. Limitação de Responsabilidade
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Em nenhuma circunstância</strong> seremos responsáveis
                por{" "}
                <strong>
                  danos indiretos, incidentais, especiais ou consequenciais
                </strong>{" "}
                decorrentes do uso do Vendinhas.app, mesmo se avisados da
                possibilidade de tais danos. Nossa{" "}
                <strong>responsabilidade total não excederá</strong> o valor pago
                por você nos últimos <strong>12 meses</strong>.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                10. Alterações nos Termos
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Podemos <strong>atualizar estes Termos</strong> a qualquer
                momento. Notificaremos você sobre mudanças significativas via{" "}
                <strong>e-mail</strong> ou no aplicativo. O{" "}
                <strong>uso continuado</strong> após as alterações constitui{" "}
                <strong>aceitação</strong>.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                11. Lei Aplicável
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Estes Termos são regidos pelas{" "}
                <strong>leis da República Federativa do Brasil</strong>, sem
                consideração a conflitos de princípios legais. Qualquer disputa
                será resolvida exclusivamente nos{" "}
                <strong>tribunais do Rio de Janeiro, RJ</strong>.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                12. Contato
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Para dúvidas sobre estes Termos, entre em contato conosco em{" "}
                <a
                  href="mailto:suporte@vendinhas.app"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  suporte@vendinhas.app
                </a>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
