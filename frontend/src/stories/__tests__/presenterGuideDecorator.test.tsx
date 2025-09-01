import React from "react";
import { render, screen } from "@testing-library/react";

import { presenterGuideDecorator } from "../../../.storybook/presenterGuideDecorator";

function FakeStory() {
  return <div data-testid="story">Story</div>;
}

describe("Presenter Guide Decorator", () => {
  it("renders overlay when presenterGuide=true", () => {
    const Comp = () => presenterGuideDecorator(FakeStory, { globals: { presenterGuide: true } });
    render(<Comp />);
    expect(screen.getByRole("dialog", { name: /presenter guide/i })).toBeInTheDocument();
  });

  it("does not render overlay when presenterGuide=false", () => {
    const Comp = () => presenterGuideDecorator(FakeStory, { globals: { presenterGuide: false } });
    render(<Comp />);
    expect(screen.queryByRole("dialog", { name: /presenter guide/i })).toBeNull();
  });
});
