'use client';

import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScenarioStatus } from '@/types/scenario/scenario.enum';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCategoriesStore } from '@/store/categories.store';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Check, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { TagInput } from '@/components/ui/tags-input';
import { useScenarioStore } from '@/store/scenario.store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { IScenario } from '@/types/scenario/scenario.type';
import FileUploadButton from '@/components/ui/file-upload-button';
import { useDifficultiesStore } from '@/store/diffuculties.store';
import { useCallerTypesStore } from '@/store/caller-types.store';
import { useTonesStore } from '@/store/tones.store';

const SCORING_FIELDS = [
  'warmthTone',
  'rapportName',
  'timingDiscipline',
  'accuracyCompliance',
  'objectionHandling',
  'closeConfirmation',
  'controlForward',
] as const;

const scenarioSchema = z
  .object({
    title: z.string().nonempty('Title is required.'),
    description: z.string().nonempty('Description is required.'),
    categoryId: z.string().nonempty('Category ID is required.'),
    difficultyId: z.string().nonempty('Difficulty ID is required.'),
    callerTypeId: z.string().nonempty('Caller type ID is required.'),
    toneId: z.string().nonempty('Tone ID is required.'),
    urgency: z
      .number()
      .min(1, 'Urgency must be greater than or equal to 1.')
      .max(10, 'Urgency must be less than or equal to 10.'),
    backstory: z.string().nonempty("Patient's backstory is required."),
    goals: z.array(z.string()).nonempty('Scenario goals are required.'),
    objections: z.array(z.string()).nonempty('Scenario objections are required.'),
    expectedBehaviorsChecklist: z
      .array(z.string())
      .nonempty('Expected behaviors checklist are required.'),
    requiredPhrases: z.array(z.string()).nonempty('Required phrases are required.'),
    forbiddenPhrases: z.array(z.string()).nonempty('Forbidden phrases are required.'),
    mustAskQuestions: z.array(z.string()).nonempty('Must-ask questions are required.'),
    complianceRules: z.array(z.string()).nonempty('Compliance rules are required.'),
    warmthTone: z
      .number()
      .int("Warmth tone must be an integer. Don't include percent or decimal.")
      .min(0)
      .max(100),
    rapportName: z
      .number()
      .int("Rapport & name must be an integer. Don't include percent or decimal.")
      .min(0)
      .max(100),
    timingDiscipline: z
      .number()
      .int("Timing discipline must be an integer. Don't include percent or decimal.")
      .min(0)
      .max(100),
    accuracyCompliance: z
      .number()
      .int("Accuracy & compliance must be an integer. Don't include percent or decimal.")
      .min(0)
      .max(100),
    objectionHandling: z
      .number()
      .int("Objection handling must be an integer. Don't include percent or decimal.")
      .min(0)
      .max(100),
    closeConfirmation: z
      .number()
      .int("Close & confirmation must be an integer. Don't include percent or decimal.")
      .min(0)
      .max(100),
    controlForward: z
      .number()
      .int("Control & forward must be an integer. Don't include percent or decimal.")
      .min(0)
      .max(100),
    adminFeedback: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const total =
      Number(data.warmthTone) +
      Number(data.rapportName) +
      Number(data.timingDiscipline) +
      Number(data.accuracyCompliance) +
      Number(data.objectionHandling) +
      Number(data.closeConfirmation) +
      Number(data.controlForward);

    const scoringTotalError = `Total score must equal 100. Current total: ${total}`;
    if (total !== 100) {
      const scoringPaths = [
        'warmthTone',
        'rapportName',
        'timingDiscipline',
        'accuracyCompliance',
        'objectionHandling',
        'closeConfirmation',
        'controlForward',
      ] as const;
      scoringPaths.forEach((path) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: scoringTotalError,
          path: [path],
        });
      });
    }
  });

interface IScenarioForm {
  isCreate?: boolean;
  scenario?: IScenario;
}

export function ScenarioForm({ isCreate = true, scenario }: IScenarioForm) {
  const router = useRouter();
  const { categories, isLoading: isLoadingCategories, fetchCategories } = useCategoriesStore();
  const {
    difficulties,
    isLoading: isLoadingDifficulties,
    fetchDifficulties,
  } = useDifficultiesStore();
  const { callerTypes, isLoading: isLoadingCallerTypes, fetchCallerTypes } = useCallerTypesStore();
  const { tones, isLoading: isLoadingTones, fetchTones } = useTonesStore();
  const { createScenario, updateScenario, parseScenarioFile, isLoading } = useScenarioStore(
    (state) => state.scenarios,
  );

  const form = useForm<z.infer<typeof scenarioSchema>>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      title: scenario?.currentVersion.title ?? '',
      description: scenario?.currentVersion.description ?? '',
      categoryId: scenario?.currentVersion.categoryId ?? '',
      difficultyId: scenario?.currentVersion.difficultyId ?? '',
      callerTypeId: scenario?.currentVersion.callerTypeId ?? '',
      toneId: scenario?.currentVersion.toneId ?? '',
      urgency: scenario?.currentVersion.urgency ?? 1,
      backstory: scenario?.currentVersion.backstory ?? '',
      goals: scenario?.currentVersion.goals ?? [],
      objections: scenario?.currentVersion.objections ?? [],
      expectedBehaviorsChecklist: scenario?.currentVersion.expectedBehaviorsChecklist ?? [],
      requiredPhrases: scenario?.currentVersion.requiredPhrases ?? [],
      forbiddenPhrases: scenario?.currentVersion.forbiddenPhrases ?? [],
      mustAskQuestions: scenario?.currentVersion.mustAskQuestions ?? [],
      complianceRules: scenario?.currentVersion.complianceRules ?? [],
      warmthTone: scenario?.currentVersion.warmthTone ?? 15,
      rapportName: scenario?.currentVersion.rapportName ?? 10,
      timingDiscipline: scenario?.currentVersion.timingDiscipline ?? 10,
      accuracyCompliance: scenario?.currentVersion.accuracyCompliance ?? 15,
      objectionHandling: scenario?.currentVersion.objectionHandling ?? 20,
      closeConfirmation: scenario?.currentVersion.closeConfirmation ?? 10,
      controlForward: scenario?.currentVersion.controlForward ?? 20,
      adminFeedback: scenario?.currentVersion.adminFeedback ?? undefined,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(
    data: z.infer<typeof scenarioSchema>,
    status: ScenarioStatus.PUBLISHED | ScenarioStatus.DRAFT,
  ) {
    try {
      const res: IScenario | null = isCreate
        ? await createScenario(data, status)
        : await updateScenario(scenario?.id || '', data, status);

      if (!res) {
        toast.error(isCreate ? 'Failed to create scenario.' : 'Failed to update scenario.');
        return;
      }

      toast.success(isCreate ? 'Scenario created successfully.' : 'Scenario updated successfully.');
      router.push('/scenarios');
    } catch (e) {
      console.log(e);
      toast.error('Failed to create scenario.');
    }
  }

  const uploadDocument = async (file: File) => {
    try {
      const parsedFile = await parseScenarioFile(file);
      if (typeof parsedFile === 'string') {
        toast.error(parsedFile);
        return;
      }

      form.reset({
        title: parsedFile.title ?? form.getValues('title'),
        description: parsedFile.description ?? form.getValues('description'),
        categoryId: form.getValues('categoryId'),
        difficultyId: form.getValues('difficultyId'),
        callerTypeId: form.getValues('callerTypeId'),
        toneId: form.getValues('toneId'),
        urgency: parsedFile.urgency ?? form.getValues('urgency'),
        backstory: parsedFile.backstory ?? form.getValues('backstory'),
        goals: parsedFile.goals ?? form.getValues('goals'),
        objections: parsedFile.objections ?? form.getValues('objections'),
        expectedBehaviorsChecklist:
          parsedFile.expectedBehaviorsChecklist ?? form.getValues('expectedBehaviorsChecklist'),
        requiredPhrases: parsedFile.requiredPhrases ?? form.getValues('requiredPhrases'),
        forbiddenPhrases: parsedFile.forbiddenPhrases ?? form.getValues('forbiddenPhrases'),
        mustAskQuestions: parsedFile.mustAskQuestions ?? form.getValues('mustAskQuestions'),
        complianceRules: parsedFile.complianceRules ?? form.getValues('complianceRules'),
        warmthTone: parsedFile.warmthTone ?? form.getValues('warmthTone'),
        rapportName: parsedFile.rapportName ?? form.getValues('rapportName'),
        timingDiscipline: parsedFile.timingDiscipline ?? form.getValues('timingDiscipline'),
        accuracyCompliance: parsedFile.accuracyCompliance ?? form.getValues('accuracyCompliance'),
        objectionHandling: parsedFile.objectionHandling ?? form.getValues('objectionHandling'),
        closeConfirmation: parsedFile.closeConfirmation ?? form.getValues('closeConfirmation'),
        controlForward: parsedFile.controlForward ?? form.getValues('controlForward'),
        adminFeedback: parsedFile.adminFeedback ?? form.getValues('adminFeedback'),
      });

      toast.success('Document uploaded successfully.');
    } catch (e) {
      console.log(e);
      toast.error('Failed to upload document.');
    }
  };

  useEffect(() => {
    if (categories.length === 0) {
      (async () => {
        await fetchCategories();
      })();
    }

    if (difficulties.length === 0) {
      (async () => {
        await fetchDifficulties();
      })();
    }

    if (tones.length === 0) {
      (async () => {
        await fetchTones();
      })();
    }

    if (callerTypes.length === 0) {
      (async () => {
        await fetchCallerTypes();
      })();
    }
  }, []);

  return (
    <form id="scenario-form" className="w-full" autoComplete="off">
      <div className="w-full flex justify-end mb-2">
        <FileUploadButton onFileSelect={uploadDocument} />
      </div>
      <Accordion
        type="multiple"
        className="w-full flex flex-col gap-6"
        defaultValue={[
          'scenario-basics',
          'patient-backstory',
          'rules-constraints',
          'scoring-weights',
        ]}
      >
        <AccordionItem
          value="scenario-basics"
          className="rounded-sm border border-border shadow-sm"
        >
          <AccordionTrigger className="w-full p-4 border-b border-border rounded-b-none bg-card">
            Scenario Basics
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <FieldGroup className="gap-4">
              <Controller
                name="title"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-title">
                      Title <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="scenario-title"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter scenario title"
                      autoComplete="off"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="description"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-description">
                      Description <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="scenario-description"
                      className="min-h-[100px]"
                      aria-invalid={fieldState.invalid}
                      placeholder="Describe the scenario goals and details"
                      autoComplete="off"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <FieldGroup className="flex flex-col md:flex-row gap-4">
                <Controller
                  name="categoryId"
                  disabled={isLoading}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel htmlFor="scenario-category">
                        Category <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="scenario-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="flex justify-center items-center h-full">
                              Loading...
                            </div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="difficultyId"
                  disabled={isLoading}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel htmlFor="scenario-difficulty">
                        Difficulty <span className="text-red-500">*</span>
                      </FieldLabel>
                      <ToggleGroup
                        id="scenario-difficulty"
                        type="single"
                        variant="outline"
                        disabled={isLoadingDifficulties}
                        spacing={2}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        {difficulties.map((difficulty) => (
                          <ToggleGroupItem key={difficulty.id} value={difficulty.id}>
                            {field.value === difficulty.id && <Check className="w-5 h-5" />}
                            {difficulty.title}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="patient-backstory"
          className="rounded-sm border border-border shadow-sm"
        >
          <AccordionTrigger className="w-full p-4 border-b border-border rounded-b-none bg-card">
            Patient Backstory
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <FieldGroup className="flex flex-col md:flex-row gap-4">
              <Controller
                name="callerTypeId"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-caller-type">
                      Caller type <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select disabled={isLoadingCallerTypes} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="scenario-caller-type">
                        <SelectValue placeholder="Select caller type" />
                      </SelectTrigger>
                      <SelectContent>
                        {callerTypes.map((callerType) => (
                          <SelectItem key={callerType.id} value={callerType.id}>
                            {callerType.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="toneId"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-tone">
                      Tone <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select disabled={isLoadingTones} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="scenario-tone">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((tone) => (
                          <SelectItem key={tone.id} value={tone.id}>
                            {tone.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="urgency"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-urgency">Urgency ({field.value})</FieldLabel>
                    <div className="h-full w-full flex flex-col items-center justify-center mt-2 md:mt-0">
                      <Slider
                        id="scenario-urgency"
                        defaultValue={[field.value]}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        aria-label="Urgency slider"
                      />
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
            <div className="w-full h-[1px] bg-border my-6" />
            <FieldGroup className="flex flex-col gap-4">
              <Controller
                name="backstory"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-backstory">
                      Backstory <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="scenario-backstory"
                      className="min-h-[100px]"
                      aria-invalid={fieldState.invalid}
                      placeholder="Describe the patient's backstory, concerns and context."
                      autoComplete="off"
                    />
                    <span className="text-sm text-gray-600 mt-1">
                      Summarize the patient's situation and mindset to guide the AI responses. You
                      don't need to be exhaustive. The AI will intelligently expand on what you
                      provide.
                    </span>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="goals"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-goals">
                      Goals <span className="text-red-500">*</span>
                    </FieldLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add goals"
                      aria-label="Scenario goals"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="rules-constraints"
          className="rounded-sm border border-border shadow-sm"
        >
          <AccordionTrigger className="w-full p-4 border-b border-border rounded-b-none bg-card">
            Rules & Constraints
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <FieldGroup className="flex flex-col gap-4">
              <Controller
                name="requiredPhrases"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-required-phrases">
                      Required phrases <span className="text-red-500">*</span>
                    </FieldLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add required phrases"
                      aria-label="Scenario required phrases"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="forbiddenPhrases"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-forbidden-phrases">
                      Forbidden phrases <span className="text-red-500">*</span>
                    </FieldLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add forbidden phrases"
                      aria-label="Scenario forbidden phrases"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="mustAskQuestions"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-must-ask-questions">
                      Must-ask questions <span className="text-red-500">*</span>
                    </FieldLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add must-ask questions"
                      aria-label="Scenario must-ask questions"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="complianceRules"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-compliance-rules">
                      Compliance rules <span className="text-red-500">*</span>
                    </FieldLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add compliance rules"
                      aria-label="Scenario compliance rules"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <div className="w-full h-[1px] bg-border my-6" />
            <FieldGroup className="flex flex-col gap-4">
              <Controller
                name="objections"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-objections">
                      Objections <span className="text-red-500">*</span>
                    </FieldLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add objections"
                      aria-label="Scenario objections"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="expectedBehaviorsChecklist"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="scenario-expectedBehaviorsChecklist">
                      Expected Behaviors Checklist <span className="text-red-500">*</span>
                    </FieldLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add expected behaviors"
                      aria-label="Scenario expected behaviors"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="scoring-weights"
          className="rounded-sm border border-border shadow-sm"
        >
          <AccordionTrigger className="w-full p-4 border-b border-border rounded-b-none bg-card">
            Scoring Weights
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {form.formState.errors.warmthTone?.message?.includes('Total score') && (
                <div className="col-span-12 bg-red-50 border border-red-500 p-3">
                  <div className="flex flex-row items-center gap-2">
                    <CircleAlert className="text-red-500 h-5" />
                    <FieldError
                      className="font-medium"
                      errors={[form.formState.errors.warmthTone]}
                    />
                  </div>
                </div>
              )}
              <Controller
                name="warmthTone"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-12 md:col-span-4"
                  >
                    <FieldLabel htmlFor="scenario-warmthTone">Warmth & Tone (%)</FieldLabel>
                    <Input
                      {...field}
                      id="scenario-warmthTone"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter scenario warmth & tone"
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                        );
                        void form.trigger(SCORING_FIELDS);
                      }}
                      autoComplete="off"
                    />
                    {fieldState.invalid && !fieldState.error?.message?.includes('Total score') && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="rapportName"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-12 md:col-span-4"
                  >
                    <FieldLabel htmlFor="scenario-rapportName">Rapport & Name Usage (%)</FieldLabel>
                    <Input
                      {...field}
                      id="scenario-rapportName"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter rapport & name usage"
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                        );
                        void form.trigger(SCORING_FIELDS);
                      }}
                      autoComplete="off"
                    />
                    {fieldState.invalid && !fieldState.error?.message?.includes('Total score') && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="timingDiscipline"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-12 md:col-span-4"
                  >
                    <FieldLabel htmlFor="scenario-timingDiscipline">
                      Timing Discipline (%)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="scenario-timingDiscipline"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter timing discipline"
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                        );
                        void form.trigger(SCORING_FIELDS);
                      }}
                      autoComplete="off"
                    />
                    {fieldState.invalid && !fieldState.error?.message?.includes('Total score') && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="accuracyCompliance"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-12 md:col-span-3"
                  >
                    <FieldLabel htmlFor="scenario-accuracyCompliance">
                      Accuracy & Compliance (%)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="scenario-accuracyCompliance"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter accuracy & compliance"
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                        );
                        void form.trigger(SCORING_FIELDS);
                      }}
                      autoComplete="off"
                    />
                    {fieldState.invalid && !fieldState.error?.message?.includes('Total score') && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="objectionHandling"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-12 md:col-span-3"
                  >
                    <FieldLabel htmlFor="scenario-objectionHandling">
                      Objection Handling (%)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="scenario-objectionHandling"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter objection handling"
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                        );
                        void form.trigger(SCORING_FIELDS);
                      }}
                      autoComplete="off"
                    />
                    {fieldState.invalid && !fieldState.error?.message?.includes('Total score') && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="closeConfirmation"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-12 md:col-span-3"
                  >
                    <FieldLabel htmlFor="scenario-closeConfirmation">
                      Close & Confirmation (%)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="scenario-closeConfirmation"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter close & confirmation"
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                        );
                        void form.trigger(SCORING_FIELDS);
                      }}
                      autoComplete="off"
                    />
                    {fieldState.invalid && !fieldState.error?.message?.includes('Total score') && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="controlForward"
                disabled={isLoading}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-12 md:col-span-3"
                  >
                    <FieldLabel htmlFor="scenario-controlForward">
                      Control & Forward Progress (%)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="scenario-controlForward"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter control & forward progress"
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                        );
                        void form.trigger(SCORING_FIELDS);
                      }}
                      autoComplete="off"
                    />
                    {fieldState.invalid && !fieldState.error?.message?.includes('Total score') && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <div className="w-full h-[1px] bg-border my-6" />
            <Controller
              name="adminFeedback"
              disabled={isLoading}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="scenario-adminFeedback">
                    Personal Feedback (optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="scenario-adminFeedback"
                    className="min-h-[100px]"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter personal feedback (optional)"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-row item-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-fit mt-4"
          onClick={form.handleSubmit((data) => onSubmit(data, ScenarioStatus.DRAFT))}
          disabled={isLoading}
        >
          Save to Draft
        </Button>
        <Button
          type="button"
          className="w-fit mt-4"
          onClick={form.handleSubmit((data) => onSubmit(data, ScenarioStatus.PUBLISHED))}
          disabled={isLoading}
        >
          Publish
        </Button>
      </div>
    </form>
  );
}
