"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon, BotIcon, ZapIcon, UsersIcon, ShieldCheckIcon } from "lucide-react"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Card 1: AI Deflection */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <BotIcon className="size-3.5 text-primary" />
            AI Deflected Chats
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,482
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">
              <TrendingUpIcon />
              +42.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-emerald-400">
            Resolved autonomously
          </div>
          <div className="text-muted-foreground text-xs">
            Using uploaded knowledge base
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Response Latency */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <ZapIcon className="size-3.5 text-amber-400" />
            Avg Inference Time
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            118 ms
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">
              <TrendingDownIcon />
              -15%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Fast RAG retrieval
          </div>
          <div className="text-muted-foreground text-xs">
            Median first-token latency
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Human Escalations */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <UsersIcon className="size-3.5 text-blue-400" />
            Human Handoffs
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            48
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">
              <TrendingDownIcon />
              -18.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Seamless operator handoffs
          </div>
          <div className="text-muted-foreground text-xs">
            Visitor context preserved
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Grounding Accuracy */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <ShieldCheckIcon className="size-3.5 text-emerald-400" />
            Guardrail Accuracy
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            99.9%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">
              <TrendingUpIcon />
              +0.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-emerald-400">
            Zero off-topic answers
          </div>
          <div className="text-muted-foreground text-xs">
            Adversarial prompts rejected
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
