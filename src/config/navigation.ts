import {
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Activity,
  Calculator,
  Brain,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  description?: string;
  vb5Form?: string; // Original VB5 form name for reference
  items?: NavItem[];
}

export interface NavSection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Time Study",
    icon: Clock,
    items: [
      {
        title: "Time Study",
        url: "/time-study",
        vb5Form: "frmTimeStudy",
        description: "Collect and analyze element times",
      },
      {
        title: "Observations Input",
        url: "/time-study/observations",
        vb5Form: "frmTSObsIn",
        description: "Enter time study observations",
      },
      {
        title: "Summary",
        url: "/time-study/summary",
        vb5Form: "frmTSSummary",
        description: "View time study summary statistics",
      },
      {
        title: "Westinghouse Rating",
        url: "/time-study/westinghouse",
        vb5Form: "frmWesting",
        description: "Apply Westinghouse rating factors",
      },
      {
        title: "Forecasting",
        url: "/time-study/forecast",
        vb5Form: "frmTSFore",
        description: "Time study forecasting",
      },
    ],
  },
  {
    title: "Learning Curves",
    icon: TrendingUp,
    items: [
      {
        title: "Overview",
        url: "/learning-curves",
        vb5Form: "frmLCMain",
        description: "Learning curve analysis methods",
      },
      {
        title: "Two-Point Method",
        url: "/learning-curves/two-point",
        vb5Form: "frmLCTpt",
        description: "Calculate learning rate from two data points",
      },
      {
        title: "Regression Method",
        url: "/learning-curves/regression",
        vb5Form: "frmLCReg",
        description: "Least squares regression analysis",
      },
      {
        title: "Graph",
        url: "/learning-curves/graph",
        vb5Form: "frmLCGraph",
        description: "Visualize learning curve data",
      },
    ],
  },
  {
    title: "Work Sampling",
    icon: BarChart3,
    items: [
      {
        title: "Calculator",
        url: "/work-sampling",
        vb5Form: "frmWSMain",
        description: "Work sampling sample size calculation",
      },
      {
        title: "Random Schedule",
        url: "/work-sampling/random",
        vb5Form: "frmWSRnd",
        description: "Generate random observation times",
      },
      {
        title: "Results",
        url: "/work-sampling/results",
        vb5Form: "frmWSRes",
        description: "View work sampling results",
      },
    ],
  },
  {
    title: "Standard Data",
    icon: Settings,
    items: [
      {
        title: "Drill Press",
        url: "/standard-data/drill",
        vb5Form: "frmDrill",
        description: "Drill press operation times",
      },
      {
        title: "Lathe",
        url: "/standard-data/lathe",
        vb5Form: "frmLathe",
        description: "Lathe operation times",
      },
      {
        title: "Mill",
        url: "/standard-data/mill",
        vb5Form: "frmMill",
        description: "Milling operation times",
      },
    ],
  },
  {
    title: "Ergonomics",
    icon: Activity,
    items: [
      {
        title: "NIOSH Lifting",
        url: "/ergonomics/niosh",
        vb5Form: "frmNIOSH",
        description: "NIOSH lifting equation calculator",
      },
      {
        title: "CTD Checklist",
        url: "/ergonomics/ctd",
        vb5Form: "frmCTD",
        description: "Cumulative trauma disorder assessment",
      },
      {
        title: "Noise",
        url: "/ergonomics/noise",
        vb5Form: "frmNoise",
        description: "OSHA noise dose calculation",
      },
      {
        title: "Illumination",
        url: "/ergonomics/illumination",
        vb5Form: "frmIllumination",
        description: "Illumination level recommendations",
      },
      {
        title: "Heat Stress",
        url: "/ergonomics/heat-stress",
        vb5Form: "frmHeatStress",
        description: "Heat stress assessment",
      },
      {
        title: "Visual Inspection",
        url: "/ergonomics/visual-inspection",
        vb5Form: "frmVisualInsp",
        description: "Visual inspection analysis",
      },
    ],
  },
  {
    title: "Quantitative Methods",
    icon: Calculator,
    items: [
      {
        title: "Pareto Chart",
        url: "/quantitative/pareto",
        vb5Form: "frmPareto",
        description: "Pareto analysis (80/20 rule)",
      },
      {
        title: "GANTT Chart",
        url: "/quantitative/gantt",
        vb5Form: "frmGantt",
        description: "Project scheduling",
      },
      {
        title: "Flow Process Chart",
        url: "/quantitative/flow-process",
        vb5Form: "frmFPCInput",
        description: "Process flow documentation",
      },
      {
        title: "Man-Machine",
        url: "/quantitative/man-machine",
        vb5Form: "frmManMC",
        description: "Worker-machine relationship analysis",
      },
      {
        title: "Incentive Systems",
        url: "/quantitative/incentives",
        vb5Form: "frmIncent",
        description: "Wage incentive plan analysis",
      },
      {
        title: "Break-Even",
        url: "/quantitative/break-even",
        vb5Form: "frmBreakEven",
        description: "Break-even analysis",
      },
      {
        title: "Value Engineering",
        url: "/quantitative/value-engineering",
        vb5Form: "frmValueEng",
        description: "Value engineering analysis",
      },
    ],
  },
  {
    title: "Psychology Tests",
    icon: Brain,
    items: [
      {
        title: "Fitts' Law",
        url: "/psychology/fitts",
        vb5Form: "frmFittsTest",
        description: "Fitts' law tapping task",
      },
      {
        title: "Stroop Test",
        url: "/psychology/stroop",
        vb5Form: "frmStroop",
        description: "Color-word interference test",
      },
      {
        title: "Simple Reaction Time",
        url: "/psychology/simple-rt",
        vb5Form: "frmSRTExp",
        description: "Simple reaction time measurement",
      },
      {
        title: "Choice Reaction Time",
        url: "/psychology/choice-rt",
        vb5Form: "frmCRTExp",
        description: "Choice reaction time measurement",
      },
      {
        title: "Memory Span",
        url: "/psychology/memory-span",
        vb5Form: "frmMemorySpan",
        description: "Short-term memory span test",
      },
    ],
  },
];

// Flatten navigation for route generation
export function getAllRoutes(): NavItem[] {
  const routes: NavItem[] = [];
  for (const section of navigation) {
    for (const item of section.items) {
      routes.push(item);
      if (item.items) {
        routes.push(...item.items);
      }
    }
  }
  return routes;
}

// Get section by URL prefix
export function getSectionByUrl(url: string): NavSection | undefined {
  return navigation.find((section) =>
    section.items.some(
      (item) => url.startsWith(item.url) || item.items?.some((sub) => url.startsWith(sub.url))
    )
  );
}
