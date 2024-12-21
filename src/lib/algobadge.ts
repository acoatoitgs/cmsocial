import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/macro";
import type { Scores as TerryScores } from "@olinfo/terry-api";
import type { User } from "@olinfo/training-api";
import { map, mapValues } from "lodash-es";

export enum CategoryId {
  DP = "dp",
  DS = "ds",
  Graph = "graph",
  Greedy = "greedy",
  Intro = "intro",
  Lib = "lib",
  Math = "math",
  Rec = "rec",
}

export type Task = {
  name: string;
  terry?: boolean;
  maxScore?: number;
};

export type Category = {
  title: MessageDescriptor;
  parent: CategoryId | null;
  position: [number, number];
  tasks: Task[];
};

export const algobadge: Record<CategoryId, Category> = {
  [CategoryId.DP]: {
    title: msg`Programmazione dinamica`,
    parent: CategoryId.Rec,
    position: [3, 3],
    tasks: [
      {
        name: "mostra",
        terry: true,
        maxScore: 50,
      },
      {
        name: "preoii_treni",
      },
      {
        name: "ois_nonna",
      },
    ],
  },
  [CategoryId.DS]: {
    title: msg`Strutture dati`,
    parent: CategoryId.Graph,
    position: [4, 2],
    tasks: [
      {
        name: "calcio",
        terry: true,
        maxScore: 50,
      },
      {
        name: "museo",
      },
      {
        name: "oii_paletta",
      },
    ],
  },
  [CategoryId.Graph]: {
    title: msg`Grafi`,
    parent: CategoryId.Lib,
    position: [3, 2],
    tasks: [
      {
        name: "interruttori",
        terry: true,
        maxScore: 50,
      },
      {
        name: "connessioni",
      },
      {
        name: "mincammino2",
      },
    ],
  },
  [CategoryId.Greedy]: {
    title: msg`Greedy, sorting e searching`,
    parent: CategoryId.Lib,
    position: [3, 1],
    tasks: [
      {
        name: "collezionismo",
        terry: true,
        maxScore: 50,
      },
      {
        name: "abc_quadri",
      },
      {
        name: "ois_truffa",
      },
    ],
  },
  [CategoryId.Intro]: {
    title: msg`Problemi introduttivi`,
    parent: null,
    position: [1, 2],
    tasks: [
      {
        name: "download",
        terry: true,
        maxScore: 50,
      },
      {
        name: "ois_biglietti",
      },
      {
        name: "massimo",
      },
    ],
  },
  [CategoryId.Lib]: {
    title: msg`Funzioni di Libreria`,
    parent: CategoryId.Intro,
    position: [2, 1],
    tasks: [
      {
        name: "cestini",
        terry: true,
        maxScore: 50,
      },
      {
        name: "catalogo",
      },
      {
        name: "autogrill",
      },
    ],
  },
  [CategoryId.Math]: {
    title: msg`Matematica`,
    parent: CategoryId.Intro,
    position: [2, 2],
    tasks: [
      {
        name: "caramelle",
        terry: true,
        maxScore: 50,
      },
      {
        name: "ois_scrigni",
      },
      {
        name: "abc_rsa",
      },
    ],
  },
  [CategoryId.Rec]: {
    title: msg`Induzione e ricorsione`,
    parent: CategoryId.Intro,
    position: [2, 3],
    tasks: [
      {
        name: "antivirus",
        terry: true,
        maxScore: 50,
      },
      {
        name: "ois_cabala",
      },
      {
        name: "ctf",
      },
    ],
  },
};

export const unlockScore = 50 / 250;
export const bronzeScore = 100 / 250;
export const silverScore = 150 / 250;
export const goldScore = 200 / 250;
export const diamondScore = 250 / 250;

export enum Badge {
  Locked = 0,
  None = 1,
  Bronze = 2,
  Silver = 3,
  Gold = 4,
  Diamond = 5,
}

export type CategoryBadge = {
  category: Category;
  score: number;
  maxScore: number;
  tasks: Record<string, number>;
  badge: Badge;
};

function computeBadge(score: number, maxScore: number): Badge {
  if (score >= maxScore * diamondScore) return Badge.Diamond;
  if (score >= maxScore * goldScore) return Badge.Gold;
  if (score >= maxScore * silverScore) return Badge.Silver;
  if (score >= maxScore * bronzeScore) return Badge.Bronze;
  return Badge.None;
}

function computeCategoryBadges(
  trainingUser: User | undefined,
  terryScores: TerryScores | undefined,
  unlockEverything: boolean,
): Record<CategoryId, CategoryBadge> {
  const categoryBadges = mapValues(algobadge, (node) =>
    computeCategoryBadge(node, trainingUser, terryScores),
  );

  const visited = new Set<CategoryId>();
  const dfs = (nodeId: CategoryId) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const category = categoryBadges[nodeId];
    const parent = category.category.parent;
    let locked = false;

    if (parent) {
      dfs(parent);
      const parentNode = categoryBadges[parent];
      if (
        parentNode.badge === Badge.Locked ||
        parentNode.score < parentNode.maxScore * unlockScore
      ) {
        locked = true;
      }
    }

    if (locked) {
      category.badge = Badge.Locked;
    }
  };

  if (!unlockEverything) {
    for (const node in algobadge) {
      dfs(node as CategoryId);
    }
  }

  return categoryBadges;
}

function computeCategoryBadge(
  category: Category,
  trainingUser: User | undefined,
  terryScores: TerryScores | undefined,
): CategoryBadge {
  let score = 0;
  let maxScore = 0;
  const tasks: Record<string, number> = {};

  for (const task of category.tasks) {
    const taskMaxScore = task.maxScore ?? 100;
    if (task.terry) {
      const terryTask = terryScores?.find((t) => t.name === task.name);
      tasks[task.name] = terryTask ? (terryTask.score / terryTask.max_score) * taskMaxScore : 0;
    } else {
      tasks[task.name] = trainingUser?.scores?.find((t) => t.name === task.name)?.score ?? 0;
    }
    score += tasks[task.name];
    maxScore += taskMaxScore;
  }

  return {
    category,
    score: Math.round(score * 10) / 10,
    maxScore,
    tasks,
    badge: computeBadge(score, maxScore),
  };
}

export const badgeBackground: Record<Badge, `bg-${string}`> = {
  [Badge.None]: "bg-white",
  [Badge.Locked]: "bg-neutral-500",
  [Badge.Bronze]: "bg-amber-600",
  [Badge.Silver]: "bg-gray-400",
  [Badge.Gold]: "bg-amber-400",
  [Badge.Diamond]: "bg-cyan-400",
};

export const badgeStroke: Record<Badge, `stroke-${string}`> = {
  [Badge.None]: "stroke-transparent",
  [Badge.Locked]: "stroke-transparent",
  [Badge.Bronze]: "stroke-amber-600",
  [Badge.Silver]: "stroke-gray-400",
  [Badge.Gold]: "stroke-amber-400",
  [Badge.Diamond]: "stroke-cyan-400",
};

export const badgeColor: Record<Badge, string> = {
  [Badge.None]: "",
  [Badge.Locked]: "",
  [Badge.Bronze]: "text-amber-700",
  [Badge.Silver]: "text-gray-500",
  [Badge.Gold]: "text-amber-500",
  [Badge.Diamond]: "text-cyan-500",
};

export function getUserBadges(
  user: User | undefined,
  terryScores: TerryScores | undefined,
  unlock?: boolean,
) {
  const badges = computeCategoryBadges(user, terryScores, unlock ?? false);
  const totalBadge = badges ? (Math.min(...map(badges, "badge")) as Badge) : Badge.None;
  return { badges, totalBadge };
}
