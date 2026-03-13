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
        patient_trigger_line: string;
        correct_answer_to_mimic: string;
        variations: string[];
        explanation: string;
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

    structural_compliance_check: {
      "name_captured": "present" | "late_or_weak" | "missing",
      "referral_source_asked": "present" | "late_or_weak" | "missing",
      "reason_for_calling_identified": "present" | "late_or_weak" | "missing",
      "insurance_gathered": "present" | "late_or_weak" | "missing",
      "benefits_check_explained": "present" | "late_or_weak" | "missing",
      "doctor_edification": "present" | "late_or_weak" | "missing",
      "practice_value_positioning": "present" | "late_or_weak" | "missing",
      "two_option_close": "present" | "late_or_weak" | "missing",
      "demographic_transition": "present" | "late_or_weak" | "missing",
    }
  }
}