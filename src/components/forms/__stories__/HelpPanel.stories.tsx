import type { Meta, StoryObj } from "@storybook/react-vite";
import { HelpPanel } from "../HelpPanel";

/**
 * HelpPanel provides collapsible contextual help for each calculator module.
 * Supports formula display and textbook reference citations. Designed to
 * replace the 8 VB5 help forms (frmhlpTSDE, frmhlpLC, etc.).
 *
 * **VB5 Mapping:** frmhlp* forms
 *
 * **Figma Component:** `Forms / Help Panel`
 */
const meta: Meta<typeof HelpPanel> = {
  title: "Forms/HelpPanel",
  component: HelpPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HelpPanel>;

export const Default: Story = {
  args: {
    title: "About Work Sampling",
    children: (
      <>
        <p>
          Work sampling is an indirect work measurement technique that involves
          taking random observations of workers to determine the proportion of
          time spent on various activities.
        </p>
        <HelpPanel.Formula label="Sample Size Formula">
          n = z^2 * p * (1 - p) / l^2
        </HelpPanel.Formula>
        <p>
          Where <strong>z</strong> is the z-value for the confidence level,{" "}
          <strong>p</strong> is the estimated proportion, and{" "}
          <strong>l</strong> is the desired error limit.
        </p>
        <HelpPanel.Reference>
          Niebel & Freivalds, "Methods, Standards, and Work Design", Ch. 13
        </HelpPanel.Reference>
      </>
    ),
  },
};

export const StartOpen: Story = {
  args: {
    title: "Learning Curve Theory",
    defaultOpen: true,
    children: (
      <>
        <p>
          The learning curve models how production time decreases as workers
          gain experience. The standard power model is:
        </p>
        <HelpPanel.Formula label="Unit Time Model">
          Y = a * X^b
        </HelpPanel.Formula>
        <p>
          Where <strong>a</strong> is the first unit time, <strong>X</strong>{" "}
          is the cycle number, and <strong>b</strong> is the learning exponent
          (negative for improvement).
        </p>
        <HelpPanel.Formula label="Learning Rate">
          Learning Rate = 2^b * 100%
        </HelpPanel.Formula>
        <HelpPanel.Reference>
          Niebel & Freivalds, Ch. 12; Wright (1936)
        </HelpPanel.Reference>
      </>
    ),
  },
};

export const NIOSHHelp: Story = {
  args: {
    title: "NIOSH Revised Lifting Equation",
    children: (
      <>
        <p>
          The NIOSH Revised Lifting Equation (1991) calculates the Recommended
          Weight Limit (RWL) for manual lifting tasks.
        </p>
        <HelpPanel.Formula label="RWL Equation">
          RWL = LC * HM * VM * DM * AM * FM * CM
        </HelpPanel.Formula>
        <HelpPanel.Formula label="Lifting Index">
          LI = Load Weight / RWL
        </HelpPanel.Formula>
        <p>
          <strong>Risk levels:</strong> LI &le; 1.0 = Acceptable;
          1.0 &lt; LI &le; 3.0 = Increased risk;
          LI &gt; 3.0 = High risk.
        </p>
        <HelpPanel.Reference>
          Waters, Putz-Anderson, & Garg (1993). NIOSH Publication No. 94-110.
        </HelpPanel.Reference>
      </>
    ),
  },
};

export const MinimalHelp: Story = {
  args: {
    title: "About This Module",
    children: (
      <p>
        Enter your data in the fields above and click Calculate to see results.
      </p>
    ),
  },
};
