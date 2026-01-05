import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { HomePage } from "@/modules/HomePage";
import { ModulePage } from "@/components/ModulePage";
import { WorkSamplingCalculator } from "@/modules/work-sampling";
import { LearningCurvesCalculator } from "@/modules/learning-curves";
import { NoiseDoseCalculator, NIOSHCalculator } from "@/modules/ergonomics";
import { TimeStudyCalculator } from "@/modules/time-study";
import { FittsLawTest, StroopTest } from "@/modules/psychology";
import { BreakEvenCalculator, ParetoChart } from "@/modules/quantitative";

// Generate placeholder pages for all modules
// These will be replaced with actual implementations

// Time Study
const TimeStudyPage = () => (
  <ModulePage
    title="Time Study"
    description="Collect and analyze element times for work measurement"
    vb5Form="frmTimeStudy"
  >
    <TimeStudyCalculator />
  </ModulePage>
);

const TimeStudyObservationsPage = () => (
  <ModulePage
    title="Observations Input"
    description="Enter time study observation data"
    vb5Form="frmTSObsIn"
    backUrl="/time-study"
    backLabel="Time Study"
  />
);

const TimeStudySummaryPage = () => (
  <ModulePage
    title="Time Study Summary"
    description="View statistical summary of time study data"
    vb5Form="frmTSSummary"
    backUrl="/time-study"
    backLabel="Time Study"
  />
);

const WestinghousePage = () => (
  <ModulePage
    title="Westinghouse Rating"
    description="Apply Westinghouse leveling factors (Skill, Effort, Conditions, Consistency)"
    vb5Form="frmWesting"
    backUrl="/time-study"
    backLabel="Time Study"
  />
);

const TimeStudyForecastPage = () => (
  <ModulePage
    title="Time Study Forecasting"
    description="Forecast standard times based on historical data"
    vb5Form="frmTSFore"
    backUrl="/time-study"
    backLabel="Time Study"
  />
);

// Learning Curves
const LearningCurvesPage = () => (
  <ModulePage
    title="Learning Curves"
    description="Analyze learning curve effects on production time"
    vb5Form="frmLCMain"
  >
    <LearningCurvesCalculator />
  </ModulePage>
);

const LearningCurvesGraphPage = () => (
  <ModulePage
    title="Learning Curve Graph"
    description="Visualize learning curve data and predictions"
    vb5Form="frmLCGraph"
    backUrl="/learning-curves"
    backLabel="Learning Curves"
  />
);

// Work Sampling
const WorkSamplingPage = () => (
  <ModulePage
    title="Work Sampling Calculator"
    description="Calculate required sample size for work sampling studies"
    vb5Form="frmWSMain"
  >
    <WorkSamplingCalculator />
  </ModulePage>
);

const WorkSamplingRandomPage = () => (
  <ModulePage
    title="Random Observation Schedule"
    description="Generate random observation times for work sampling"
    vb5Form="frmWSRnd"
    backUrl="/work-sampling"
    backLabel="Work Sampling"
  />
);

const WorkSamplingResultsPage = () => (
  <ModulePage
    title="Work Sampling Results"
    description="Analyze work sampling study results"
    vb5Form="frmWSRes"
    backUrl="/work-sampling"
    backLabel="Work Sampling"
  />
);

// Standard Data
const DrillPressPage = () => (
  <ModulePage
    title="Drill Press Standard Data"
    description="Calculate standard times for drill press operations"
    vb5Form="frmDrill"
  />
);

const LathePage = () => (
  <ModulePage
    title="Lathe Standard Data"
    description="Calculate standard times for lathe operations"
    vb5Form="frmLathe"
  />
);

const MillPage = () => (
  <ModulePage
    title="Mill Standard Data"
    description="Calculate standard times for milling operations"
    vb5Form="frmMill"
  />
);

// Ergonomics
const NIOSHPage = () => (
  <ModulePage
    title="NIOSH Lifting Guide"
    description="Calculate recommended weight limit using the NIOSH lifting equation"
    vb5Form="frmNIOSH"
  >
    <NIOSHCalculator />
  </ModulePage>
);

const CTDPage = () => (
  <ModulePage
    title="CTD Checklist"
    description="Cumulative Trauma Disorder risk assessment"
    vb5Form="frmCTD"
  />
);

const NoisePage = () => (
  <ModulePage
    title="Noise Dose Calculator"
    description="Calculate OSHA noise dose and time-weighted average"
    vb5Form="frmNoise"
  >
    <NoiseDoseCalculator />
  </ModulePage>
);

const IlluminationPage = () => (
  <ModulePage
    title="Illumination Levels"
    description="Recommended illumination levels for various tasks"
    vb5Form="frmIllumination"
  />
);

const HeatStressPage = () => (
  <ModulePage
    title="Heat Stress Assessment"
    description="Evaluate heat stress conditions and exposure limits"
    vb5Form="frmHeatStress"
  />
);

const VisualInspectionPage = () => (
  <ModulePage
    title="Visual Inspection"
    description="Visual inspection task analysis"
    vb5Form="frmVisualInsp"
  />
);

// Quantitative Methods
const ParetoPage = () => (
  <ModulePage
    title="Pareto Chart"
    description="Create Pareto analysis charts (80/20 rule)"
    vb5Form="frmPareto"
  >
    <ParetoChart />
  </ModulePage>
);

const GanttPage = () => (
  <ModulePage
    title="GANTT Chart"
    description="Project scheduling and timeline visualization"
    vb5Form="frmGantt"
  />
);

const FlowProcessPage = () => (
  <ModulePage
    title="Flow Process Chart"
    description="Document and analyze process flow"
    vb5Form="frmFPCInput"
  />
);

const ManMachinePage = () => (
  <ModulePage
    title="Man-Machine Chart"
    description="Analyze worker-machine synchronous relationships"
    vb5Form="frmManMC"
  />
);

const IncentivesPage = () => (
  <ModulePage
    title="Incentive Systems"
    description="Evaluate wage incentive plans"
    vb5Form="frmIncent"
  />
);

const BreakEvenPage = () => (
  <ModulePage
    title="Break-Even Analysis"
    description="Calculate break-even point for cost analysis"
    vb5Form="frmBreakEven"
  >
    <BreakEvenCalculator />
  </ModulePage>
);

const ValueEngineeringPage = () => (
  <ModulePage
    title="Value Engineering"
    description="Systematic method to improve product value"
    vb5Form="frmValueEng"
  />
);

// Psychology Tests
const FittsPage = () => (
  <ModulePage
    title="Fitts' Law Test"
    description="Measure movement time vs. target difficulty"
    vb5Form="frmFittsTest"
  >
    <FittsLawTest />
  </ModulePage>
);

const StroopPage = () => (
  <ModulePage
    title="Stroop Test"
    description="Color-word interference cognitive test"
    vb5Form="frmStroop"
  >
    <StroopTest />
  </ModulePage>
);

const SimpleRTPage = () => (
  <ModulePage
    title="Simple Reaction Time"
    description="Measure simple reaction time to stimuli"
    vb5Form="frmSRTExp"
  />
);

const ChoiceRTPage = () => (
  <ModulePage
    title="Choice Reaction Time"
    description="Measure reaction time with multiple choices"
    vb5Form="frmCRTExp"
  />
);

const MemorySpanPage = () => (
  <ModulePage
    title="Memory Span Test"
    description="Assess short-term memory capacity"
    vb5Form="frmMemorySpan"
  />
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // Time Study
      { path: "time-study", element: <TimeStudyPage /> },
      { path: "time-study/observations", element: <TimeStudyObservationsPage /> },
      { path: "time-study/summary", element: <TimeStudySummaryPage /> },
      { path: "time-study/westinghouse", element: <WestinghousePage /> },
      { path: "time-study/forecast", element: <TimeStudyForecastPage /> },
      // Learning Curves
      { path: "learning-curves", element: <LearningCurvesPage /> },
      { path: "learning-curves/graph", element: <LearningCurvesGraphPage /> },
      // Work Sampling
      { path: "work-sampling", element: <WorkSamplingPage /> },
      { path: "work-sampling/random", element: <WorkSamplingRandomPage /> },
      { path: "work-sampling/results", element: <WorkSamplingResultsPage /> },
      // Standard Data
      { path: "standard-data/drill", element: <DrillPressPage /> },
      { path: "standard-data/lathe", element: <LathePage /> },
      { path: "standard-data/mill", element: <MillPage /> },
      // Ergonomics
      { path: "ergonomics/niosh", element: <NIOSHPage /> },
      { path: "ergonomics/ctd", element: <CTDPage /> },
      { path: "ergonomics/noise", element: <NoisePage /> },
      { path: "ergonomics/illumination", element: <IlluminationPage /> },
      { path: "ergonomics/heat-stress", element: <HeatStressPage /> },
      { path: "ergonomics/visual-inspection", element: <VisualInspectionPage /> },
      // Quantitative Methods
      { path: "quantitative/pareto", element: <ParetoPage /> },
      { path: "quantitative/gantt", element: <GanttPage /> },
      { path: "quantitative/flow-process", element: <FlowProcessPage /> },
      { path: "quantitative/man-machine", element: <ManMachinePage /> },
      { path: "quantitative/incentives", element: <IncentivesPage /> },
      { path: "quantitative/break-even", element: <BreakEvenPage /> },
      { path: "quantitative/value-engineering", element: <ValueEngineeringPage /> },
      // Psychology Tests
      { path: "psychology/fitts", element: <FittsPage /> },
      { path: "psychology/stroop", element: <StroopPage /> },
      { path: "psychology/simple-rt", element: <SimpleRTPage /> },
      { path: "psychology/choice-rt", element: <ChoiceRTPage /> },
      { path: "psychology/memory-span", element: <MemorySpanPage /> },
    ],
  },
]);
