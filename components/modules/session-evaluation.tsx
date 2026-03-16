import { cn, getDurationTime } from '@/lib/utils';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  LucideCircleCheck,
  CircleX,
  AlertCircle,
  Target,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChatSessionStore } from '@/store/chat-sessions.store';
import { IChatSession } from '@/types/chat-sessions/chat-session.type';
import { ScenarioEvaluation } from '@/types/chat-sessions/session-evaluation.type';
import { ChatMessage } from '@/hooks/use-chat-socket';

interface ISessionEvaluation {
  sessionId: string;
  className?: string;
  duration: number;
}

enum Tab {
  OVERVIEW = 'overview',
  COACHING = 'coaching',
  CHAT_HISTORY = 'chat-history',
}

function ScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums w-6">
        {value}/{max}
      </span>
    </div>
  );
}

export default function SessionEvaluation({ sessionId, className, duration }: ISessionEvaluation) {
  const [evaluation, setEvaluation] = useState<ScenarioEvaluation | null>(null);
  const { getSession, isLoading, currentSession, getSessionMessages } = useChatSessionStore();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.OVERVIEW);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const chatSession: IChatSession | null = await getSession(sessionId);
        if (chatSession) {
          setEvaluation(chatSession.evaluation);
        }
      } catch (error) {
        console.error('Error fetching session evaluation:', error);
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    if (activeTab === Tab.CHAT_HISTORY && messages.length === 0) {
      setIsLoadingMessages(true);
      (async () => {
        try {
          const messages: ChatMessage[] = await getSessionMessages(sessionId);
          setMessages(messages);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        } finally {
          setIsLoadingMessages(false);
        }
      })();
    }
  }, [activeTab]);

  const handleComplianceCheck = (compliance: string) => {
    switch (compliance) {
      case 'present':
        return (
          <div className="flex flex-row items-center gap-1">
            <LucideCircleCheck className="text-green-500" />
            <span className="text-green-500 font-medium">Present</span>
          </div>
        );
      case 'late_or_weak':
        return (
          <div className="flex flex-row items-center gap-1">
            <AlertTriangle className="text-orange-500" />
            <span className="text-orange-500 font-medium">Late / Weak</span>
          </div>
        );
      case 'missing':
        return (
          <div className="flex flex-row items-center gap-1">
            <CircleX className="text-red-500" />
            <span className="text-red-500 font-medium">Missing</span>
          </div>
        );
      default:
        return (
          <div className="flex flex-row items-center gap-1">
            <span className="text-red-500 font-medium">N/A</span>
          </div>
        );
    }
  };

  return !isLoading && evaluation && currentSession ? (
    <div className={cn('flex flex-col gap-4 min-w-[300px] p-2', className)}>
      <div className="border-b border-b-border pb-2">
        <span className="text-lg font-semibold">Call Details</span>
      </div>
      {evaluation?.payload.auto_fail && evaluation?.payload.auto_fail_reasons.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="text-destructive shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-destructive">Auto fail</span>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {evaluation?.payload.auto_fail_reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Tabs defaultValue={activeTab} className="w-full h-full">
        <TabsList>
          <TabsTrigger onClick={() => setActiveTab(Tab.OVERVIEW)} value={Tab.OVERVIEW}>
            Overview
          </TabsTrigger>
          <TabsTrigger onClick={() => setActiveTab(Tab.COACHING)} value={Tab.COACHING}>
            Coaching
          </TabsTrigger>
          <TabsTrigger onClick={() => setActiveTab(Tab.CHAT_HISTORY)} value={Tab.CHAT_HISTORY}>
            Chat History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="flex flex-col gap-4">
          <Card className="w-full p-0 gap-0">
            <CardHeader className="w-full !p-4 border-b border-border">
              <CardTitle className="w-full">Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-3 !bg-white rounded-b-xl h-fit">
              <div className="flex flex-row gap-1 pb-2">
                <span className="font-medium">Scenario:</span>
                <span className="font-medium text-muted-foreground">
                  {currentSession.scenarioVersion.title}
                </span>
              </div>
              <div className="flex flex-row gap-1 pb-2">
                <span className="font-medium">Trust status</span>
                <span className="font-medium text-muted-foreground">
                  {evaluation?.payload?.scores.support_level_label}
                </span>
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-1">
                    <span className="font-medium">Date:</span>
                    <span className="font-medium text-muted-foreground">
                      {format(currentSession.createdAt, 'EEE MMM dd yyyy')}
                    </span>
                  </div>
                  <div className="flex flex-row gap-1">
                    <span className="font-medium">Duration:</span>
                    <span className="font-medium text-muted-foreground">
                      {getDurationTime(duration)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-end items-end">
                  <span className="text-sm text-muted-foreground">Overall score</span>
                  <span className="text-3xl font-semibold">
                    {evaluation?.payload.scores.performance_score}/100%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full p-0 gap-0">
            <CardHeader className="w-full !p-4 border-b border-border">
              <CardTitle className="w-full">Conversion Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-3 !bg-white rounded-b-xl h-fit">
              <div className="flex flex-col gap-3">
                <div className="flex flex-row items-center justify-between gap-2">
                  <span className="text-muted-foreground">Close type</span>
                  <span className="font-medium">
                    {evaluation?.payload.conversion_analysis.close_type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Trust level (1–5)</span>
                    <ScoreBar
                      value={evaluation?.payload.conversion_analysis.trust_level_1_to_5 || 0}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Financial repositioning (1–5)
                    </span>
                    <ScoreBar
                      value={
                        evaluation?.payload.conversion_analysis.financial_repositioning_1_to_5 || 0
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Emotional validation (1–5)
                    </span>
                    <ScoreBar
                      value={
                        evaluation?.payload.conversion_analysis.emotional_validation_1_to_5 || 0
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Authority positioning (1–5)
                    </span>
                    <ScoreBar
                      value={
                        evaluation?.payload.conversion_analysis.authority_positioning_1_to_5 || 0
                      }
                    />
                  </div>
                </div>
                {evaluation?.payload.conversion_analysis.notes && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                    <p className="text-sm">{evaluation?.payload.conversion_analysis.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="w-full p-0 gap-0">
            <CardHeader className="w-full !p-4 border-b border-border">
              <CardTitle className="w-full">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-3 !bg-white rounded-b-xl h-fit">
              <div className="grid grid-cols-2 gap-4 pb-4">
                {evaluation?.payload.scores.by_category.map((category, index) => (
                  <div
                    className="flex flex-col gap-1 p-2 border border-border bg-blue-50/10 rounded-lg"
                    key={index}
                  >
                    <div className="flex flex-row items-center justify-between gap-2 border-b border-b-border pb-2">
                      <span className="text-muted-foreground">{category.category}</span>
                      <span className="text-lg font-semibold">{category.score}/10</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Evidence:</span>
                      <ul>
                        {category.evidence.map((evidence, index) => (
                          <li key={index}>- {evidence}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Rationale:</span>
                      <span>{category.rationale}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="w-full p-0 gap-0">
            <CardHeader className="w-full !p-4 border-b border-border">
              <CardTitle className="w-full">Structural Compliance Check</CardTitle>
            </CardHeader>
            <CardContent className="p-3 !bg-white rounded-b-xl h-fit">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Name captured</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.name_captured,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Referral source asked</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.referral_source_asked,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Reason for calling identified</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.reason_for_calling_identified,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Insurance gathered</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.insurance_gathered,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Benefits check explained</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.benefits_check_explained,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Doctor edification</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.doctor_edification,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Practice value positioning</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.practice_value_positioning,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-b border-b-border pb-2">
                  <span>Two-option close</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.two_option_close,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2">
                  <span>Demographic transition</span>
                  <span>
                    {handleComplianceCheck(
                      evaluation?.payload.structural_compliance_check.demographic_transition,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coaching" className="flex flex-col gap-4">
          <Card className="w-full p-0 gap-0">
            <CardHeader className="w-full !p-4 border-b border-border">
              <CardTitle className="w-full flex items-center gap-2">
                <Lightbulb className="size-4" />
                Feedback summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 !bg-white rounded-b-xl">
              <p className="text-sm">{evaluation?.payload.coaching.feedback_summary}</p>
            </CardContent>
          </Card>
          {evaluation?.payload.coaching.strengths &&
            evaluation?.payload.coaching.strengths.length > 0 && (
              <Card className="w-full p-0 gap-0">
                <CardHeader className="w-full !p-4 border-b border-border">
                  <CardTitle className="w-full flex items-center gap-2">
                    <LucideCircleCheck className="size-4 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 !bg-white rounded-b-xl">
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {evaluation?.payload.coaching.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          {evaluation?.payload.coaching.missed_psychological_leverage &&
            evaluation?.payload.coaching.missed_psychological_leverage.length > 0 && (
              <Card className="w-full p-0 gap-0">
                <CardHeader className="w-full !p-4 border-b border-border">
                  <CardTitle className="w-full flex items-center gap-2">
                    <AlertTriangle className="size-4 text-orange-500" />
                    Missed psychological leverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 !bg-white rounded-b-xl">
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {evaluation?.payload.coaching.missed_psychological_leverage.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          {evaluation?.payload.coaching.learning_targets &&
            evaluation?.payload.coaching.learning_targets.length > 0 && (
              <Card className="w-full p-0 gap-0">
                <CardHeader className="w-full !p-4 border-b border-border">
                  <CardTitle className="w-full flex items-center gap-2">
                    <Target className="size-4" />
                    Learning targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 !bg-white rounded-b-xl">
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {evaluation?.payload.coaching.learning_targets.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          {evaluation?.payload.coaching.priority_improvements &&
            evaluation?.payload.coaching.priority_improvements.length > 0 && (
              <Card className="w-full p-0 gap-0">
                <CardHeader className="w-full !p-4 border-b border-border">
                  <CardTitle className="w-full">Priority improvements</CardTitle>
                </CardHeader>
                <CardContent className="p-3 !bg-white rounded-b-xl">
                  <div className="flex flex-col gap-4">
                    {evaluation?.payload.coaching.priority_improvements.map((imp, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-border rounded-lg bg-muted/30 space-y-2"
                      >
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Trigger / patient line
                          </span>
                          <p className="text-sm mt-0.5">{imp.patient_trigger_line}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Correct answer to mimic
                          </span>
                          <p className="text-sm mt-0.5">{imp.correct_answer_to_mimic}</p>
                        </div>
                        {imp.variations.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Variations
                            </span>
                            <ul className="text-sm list-disc list-inside mt-0.5">
                              {imp.variations.map((v, i) => (
                                <li key={i}>{v}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Why it works
                          </span>
                          <p>{imp.explanation}</p>
                        </div>
                        {imp.micro_drill && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Micro drill
                            </span>
                            <p className="text-sm mt-0.5">{imp.micro_drill}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          <Card className="w-full p-0 gap-0">
            <CardHeader className="w-full !p-4 border-b border-border">
              <CardTitle className="w-full flex items-center gap-2">
                <BookOpen className="size-4" />
                Repetition plan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 !bg-white rounded-b-xl">
              <div className="flex flex-col gap-4">
                {evaluation?.payload.coaching.repetition_plan.next_3_sessions_focus &&
                  evaluation?.payload.coaching.repetition_plan.next_3_sessions_focus.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-1">
                        Next 3 sessions focus
                      </span>
                      <ul className="text-sm list-disc list-inside space-y-0.5">
                        {evaluation?.payload.coaching.repetition_plan.next_3_sessions_focus.map(
                          (f, i) => (
                            <li key={i}>{f}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                {evaluation?.payload.coaching.repetition_plan.success_criteria &&
                  evaluation?.payload.coaching.repetition_plan.success_criteria.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-1">
                        Success criteria
                      </span>
                      <ul className="text-sm list-disc list-inside space-y-0.5">
                        {evaluation?.payload.coaching.repetition_plan.success_criteria.map(
                          (c, i) => (
                            <li key={i}>{c}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                {evaluation?.payload.coaching.repetition_plan.positive_reinforcement_rules &&
                  evaluation?.payload.coaching.repetition_plan.positive_reinforcement_rules.length >
                    0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-1">
                        Positive reinforcement rules
                      </span>
                      <ul className="text-sm list-disc list-inside space-y-0.5">
                        {evaluation?.payload.coaching.repetition_plan.positive_reinforcement_rules.map(
                          (r, i) => (
                            <li key={i}>{r}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
          {evaluation?.payload.coaching.model_call_example &&
            evaluation?.payload.coaching.model_call_example.length > 0 && (
              <Card className="w-full p-0 gap-0">
                <CardHeader className="w-full !p-4 border-b border-border">
                  <CardTitle className="w-full">Model call example</CardTitle>
                </CardHeader>
                <CardContent className="p-3 !bg-white rounded-b-xl">
                  <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                    {evaluation?.payload.coaching.model_call_example.map((line, i) => (
                      <div
                        key={i}
                        className={cn(
                          'max-w-[85%] rounded-lg p-2 text-sm',
                          i % 2 === 0
                            ? 'self-end bg-primary/15'
                            : 'self-start border border-primary/20',
                        )}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>
        <TabsContent value="chat-history" className="pb-4 h-full">
          <div className="flex flex-col gap-2 h-full">
            {isLoadingMessages ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full p-3 border border-border rounded-lg max-h-[90vh]">
                {messages.map((message, index) => (
                  <div
                    className={cn(
                      'flex flex-row gap-2 w-full',
                      message.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                    key={index}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg p-2',
                        message.role === 'user' ? 'bg-blue-300' : 'border border-primary/20',
                      )}
                    >
                      <span>{message.content}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
