import React from "react";
import { render, screen } from "@testing-library/react";

import { mswInfoDecorator } from "../../../.storybook/mswInfoDecorator";

function FakeStory() {
  return <div data-testid="story">Story</div>;
}

describe("MSW Info Decorator", () => {
  it("renders overlay when mswInfo='open'", () => {
    const Comp = () => mswInfoDecorator(FakeStory, { globals: { mswInfo: "open" } });
    render(<Comp />);
    expect(screen.getByRole("dialog", { name: /msw info/i })).toBeInTheDocument();
  });

  it("does not render overlay when mswInfo='closed'", () => {
    const Comp = () => mswInfoDecorator(FakeStory, { globals: { mswInfo: "closed" } });
    render(<Comp />);
    expect(screen.queryByRole("dialog", { name: /msw info/i })).toBeNull();
  });
});
