export interface ScenarioEvaluation {
  payload: {
    scenario_id: string;
    scenario_version_id: string;

    auto_fail: boolean;
    auto_fail_reasons: string[];

    rule_checks: {
      required_phrases: string[];
      forbidden_phrases: string[];
      must_ask_questions: string[];
      compliance_violations: string[];
    };

    scores: {
      performance_score: number;
      support_level_label: string;
      by_category: {
        category: string;
        score: number;
        evidence: string[];
        rationale: string;
      }[];
    };

    conversion_analysis: {
      close_type: string;
      trust_level_1_to_5: number;
      financial_repositioning_1_to_5: number;
      emotional_validation_1_to_5: number;
      authority_positioning_1_to_5: number;
      notes: string;
    };

    coaching: {
      feedback_summary: string;

      strengths: string[];

      priority_improvements: {
        trigger_patient_line: string;
        correct_answer_to_mimic: string;
        variations: string[];
        why_it_works: string[];
        micro_drill: string;
      }[];

      missed_psychological_leverage: string[];

      learning_targets: string[];

      repetition_plan: {
        next_3_sessions_focus: string[];
        success_criteria: string[];
        positive_reinforcement_rules: string[];
      };

      model_call_example: string[];
    };
  }
}