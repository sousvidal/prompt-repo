import { Circle } from "lucide-react";
import { PublishedCommit } from "@prisma/client";

export default function PublishedCircles({
  publishedCommits,
}: {
  publishedCommits: PublishedCommit[];
}) {
  const orderedCommits = publishedCommits.sort((a, b) => {
    const order = ["local", "staging", "acceptance", "production"];
    return order.indexOf(a.environment) - order.indexOf(b.environment);
  });

  const renderCircle = (environment: string) => {
    const color =
      environment === "local"
        ? "#cbd5e1"
        : environment === "staging"
        ? "#facc15" // yellow
        : environment === "acceptance"
        ? "#f97316" // orange
        : "#65a30d"; // green
    return (
      <Circle
        key={environment}
        className="w-4 h-4 ml-[-10px]"
        fill={color}
        stroke={color}
      />
    );
  };

  return (
    <div className="flex flex-row">
      {orderedCommits.map((commit) =>
        renderCircle(commit.environment)
      )}
    </div>
  );
}
