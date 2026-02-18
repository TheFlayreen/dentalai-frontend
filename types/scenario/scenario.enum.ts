export enum ScenarioStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ScenarioDifficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum ScenarioTone {
  CALM = 'CALM',
  FRIENDLY = 'FRIENDLY',
  NEUTRAL = 'NEUTRAL',
}

export enum ScenarioCallerType {
  NEW_PATIENT = 'NEW_PATIENT',
  EXISTING_PATIENT = 'EXISTING_PATIENT',
  PARENT = 'PARENT',
  SPOUSE = 'SPOUSE',
  EMERGENCY = 'EMERGENCY',
  PRICE_SHOPPER = 'PRICE_SHOPPER',
  INSURANCE_FOCUSED = 'INSURANCE_FOCUSED',
  UPSET_CALLER = 'UPSET_CALLER',
}
