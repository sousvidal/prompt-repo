import { Circle } from "lucide-react";
import { PublishedCommit } from "@prisma/client";

export default function PublishedCircles({
  publishedCommits,
}: {
  publishedCommits: PublishedCommit[];
}) {
  const renderCircle = (environment: string) => {
    const color =
      environment === "local"
        ? "#cbd5e1"
        : environment === "acceptance"
        ? "#f97316"
        : "#65a30d";
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
      {publishedCommits.map((publishedCommit) =>
        renderCircle(publishedCommit.environment)
      )}
    </div>
  );
}
