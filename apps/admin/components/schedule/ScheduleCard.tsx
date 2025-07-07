"use client";

import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@eugenios/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@eugenios/ui/components/dropdown-menu";
import { Badge } from "@eugenios/ui/components/badge";
import { Calendar, Eye, Printer, MoreHorizontal, Trash2, Edit, Copy, CheckCircle, X, Clock, Map } from "lucide-react";
import { ScheduleStatus, Schedule } from "@/hooks/useSchedules";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReactNode } from "react";
import { AdminOnly } from "@/components/security/RoleGuard";
import { Separator } from "@eugenios/ui/src/components/separator";

// Define the type for actions that can be performed on a schedule
export type ScheduleAction = {
  label: string;
  icon: ReactNode;
  onClick: (scheduleId: string, title?: string) => void;
  disabled?: boolean;
  destructive?: boolean;
  adminOnly?: boolean; // Flag to indicate if the action should only be visible to admins
};

// Props interface for the ScheduleCard component
interface ScheduleCardProps {
  title: string;
  schedules: Schedule[];
  status: ScheduleStatus;
  emptyMessage: string;
  actions: ScheduleAction[];
  isProcessing: string | null;
  badgeIcon?: ReactNode;
  badgeText?: string;
  badgeClassname?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  formatDate: (dateString?: string) => string;
}

// Badge component based on status
export const StatusBadge = ({ status }: { status: ScheduleStatus }) => {
  switch (status) {
    case ScheduleStatus.ATIVO:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Ativo
        </Badge>
      );
    case ScheduleStatus.PENDENTE:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" />
          Pendente
        </Badge>
      );
    case ScheduleStatus.APROVADO:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Aprovado
        </Badge>
      );
    case ScheduleStatus.RASCUNHO:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          <Edit className="mr-1 h-3 w-3" />
          Rascunho
        </Badge>
      );
    case ScheduleStatus.SUBSTITUIDO:
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Map className="mr-1 h-3 w-3" />
          Substituído
        </Badge>
      );
    case ScheduleStatus.REJEITADO:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <X className="mr-1 h-3 w-3" />
          Rejeitado
        </Badge>
      );
    default:
      return null;
  }
};

// Function to get badge properties based on status
export const getStatusBadgeProps = (status: ScheduleStatus) => {
  switch (status) {
    case ScheduleStatus.ATIVO:
      return {
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
        text: "Ativo",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      };
    case ScheduleStatus.PENDENTE:
      return {
        icon: <Clock className="mr-1 h-3 w-3" />,
        text: "Pendente",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      };
    case ScheduleStatus.APROVADO:
      return {
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
        text: "Aprovado",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      };
    case ScheduleStatus.RASCUNHO:
      return {
        icon: <Edit className="mr-1 h-3 w-3" />,
        text: "Rascunho",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      };
    case ScheduleStatus.SUBSTITUIDO:
      return {
        icon: <Map className="mr-1 h-3 w-3" />,
        text: "Substituído",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      };
    case ScheduleStatus.REJEITADO:
      return {
        icon: <X className="mr-1 h-3 w-3" />,
        text: "Rejeitado",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      };
    default:
      return {
        icon: null,
        text: "Desconhecido",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      };
  }
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  title,
  schedules,
  status,
  emptyMessage,
  actions,
  isProcessing,
  badgeIcon,
  badgeText,
  badgeClassname,
  showCreateButton = false,
  onCreateClick,
  formatDate,
}) => {
  const router = useRouter();

  // If custom badge props are not provided, use the default ones based on status
  const badgeProps =
    badgeIcon && badgeText && badgeClassname
      ? { icon: badgeIcon, text: badgeText, className: badgeClassname }
      : getStatusBadgeProps(status);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Badge variant="outline" className={badgeProps.className}>
            {badgeProps.icon}
            {badgeProps.text}
          </Badge>
        </div>
      </CardHeader>
      <Separator className="my-4" />
      <CardContent>
        {schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{schedule.titulo}</h3>
                    <div className="flex flex-col text-sm text-muted-foreground mt-1 space-y-1">
                      {/* Display information based on status */}
                      {status === ScheduleStatus.ATIVO && (
                        <>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Ativado em {formatDate(schedule.dataAtivacao || schedule.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          {schedule.aprovadoPor && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Aprovado por:</span>
                              <span>
                                {schedule.aprovadoPor} ({schedule.emailAprovador})
                              </span>
                            </div>
                          )}
                          {schedule.dataAprovacao && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Aprovado em:</span>
                              <span>{formatDate(schedule.dataAprovacao)}</span>
                            </div>
                          )}
                        </>
                      )}

                      {status === ScheduleStatus.APROVADO && (
                        <>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Aprovado em {formatDate(schedule.dataAprovacao)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Aprovado por:</span>
                            <span>
                              {schedule.aprovadoPor} ({schedule.emailAprovador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          {schedule.notaAprovacao && (
                            <div className="flex items-start">
                              <span className="font-medium mr-1">Nota:</span>
                              <span className="italic">{schedule.notaAprovacao}</span>
                            </div>
                          )}
                          {schedule.dataAtivacao && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs">
                              Ativação agendada para: {new Date(schedule.dataAtivacao).toLocaleDateString()}
                            </span>
                          )}
                        </>
                      )}

                      {status === ScheduleStatus.PENDENTE && (
                        <>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Criado em {formatDate(schedule.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Atualizado em:</span>
                            <span>{formatDate(schedule.updatedAt)}</span>
                          </div>
                        </>
                      )}

                      {status === ScheduleStatus.RASCUNHO && (
                        <>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>
                              Atualizado em {formatDate(schedule.updatedAt)}
                              {schedule.atualizadoPor && ` - ${schedule.atualizadoPor}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado em:</span>
                            <span>{formatDate(schedule.createdAt)}</span>
                          </div>
                        </>
                      )}

                      {status === ScheduleStatus.REJEITADO && (
                        <>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Rejeitado em {formatDate(schedule.updatedAt)}</span>
                          </div>
                          {schedule.aprovadoPor && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Rejeitado por:</span>
                              <span>
                                {schedule.aprovadoPor} ({schedule.emailAprovador})
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado em:</span>
                            <span>{formatDate(schedule.createdAt)}</span>
                          </div>
                          {schedule.notaAprovacao && (
                            <div className="flex items-start">
                              <span className="font-medium mr-1">Motivo:</span>
                              <span className="italic text-red-600">{schedule.notaAprovacao}</span>
                            </div>
                          )}
                        </>
                      )}

                      {status === ScheduleStatus.SUBSTITUIDO && (
                        <>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Substituído em {formatDate(schedule.updatedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Criado por:</span>
                            <span>
                              {schedule.criadoPor} ({schedule.emailCriador})
                            </span>
                          </div>
                          {schedule.aprovadoPor && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Aprovado por:</span>
                              <span>
                                {schedule.aprovadoPor} ({schedule.emailAprovador})
                              </span>
                            </div>
                          )}
                          {schedule.dataAprovacao && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Aprovado em:</span>
                              <span>{formatDate(schedule.dataAprovacao)}</span>
                            </div>
                          )}
                          {schedule.dataAtivacao && (
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Ativado em:</span>
                              <span>{formatDate(schedule.dataAtivacao)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/classes/${schedule.id}`)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>
                    {actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, index) =>
                            action.adminOnly ? (
                              <AdminOnly key={index}>
                                <DropdownMenuItem
                                  onClick={() => action.onClick(schedule.id, schedule.titulo)}
                                  disabled={isProcessing === schedule.id && action.disabled}
                                  className={action.destructive ? "text-destructive" : ""}
                                >
                                  {isProcessing === schedule.id && action.disabled ? (
                                    <>Processando...</>
                                  ) : (
                                    <>
                                      {action.icon}
                                      {action.label}
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </AdminOnly>
                            ) : (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => action.onClick(schedule.id, schedule.titulo)}
                                disabled={isProcessing === schedule.id && action.disabled}
                                className={action.destructive ? "text-destructive" : ""}
                              >
                                {isProcessing === schedule.id && action.disabled ? (
                                  <>Processando...</>
                                ) : (
                                  <>
                                    {action.icon}
                                    {action.label}
                                  </>
                                )}
                              </DropdownMenuItem>
                            )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <div className="text-sm mt-2">
                  <p>{schedule.descricao || "Sem descrição"}</p>
                  <p className="mt-2">
                    <span className="font-medium">Orçamento:</span> {schedule.orcamento?.toFixed(2) || "0.00"} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <p>{emptyMessage}</p>
            {showCreateButton && (
              <Button variant="outline" className="mt-2" onClick={onCreateClick}>
                Criar uma programação
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
