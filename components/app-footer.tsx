"use client"

import Image from "next/image"
import Link from "next/link"
import { Github, BookOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const coffeeIcon = "/icons8-buy-me-a-coffee-100.png"

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="hidden md:flex shrink-0 border-t border-border bg-background text-xs text-muted-foreground">
      <div className="flex w-full flex-col gap-2 px-4 py-1.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 text-foreground">
          <Link
            href="/docs"
            aria-label="View documentation"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <BookOpen size={16} aria-hidden="true" />
            <span className="font-medium">Documentation</span>
          </Link>
          <Link
            href="https://github.com/louistrue/ids-flow"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the GitHub repository"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Github size={16} aria-hidden="true" />
            <span className="font-medium">GitHub</span>
          </Link>
          <Link
            href="https://www.lt.plus"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit lt.plus"
            className="transition-colors hover:text-primary hover:underline"
          >
            lt.plus
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1 text-muted-foreground">
          <span className="hidden lg:inline">Built with lots of </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="https://buymeacoffee.com/louistrue"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Support this project with a coffee"
                  className="inline-flex items-center transition-colors hover:text-primary"
                >
                  <Image src={coffeeIcon} alt="Buy me a coffee" width={20} height={20} className="rounded-sm" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Support this project with a coffee</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="hidden lg:inline"> by </span>
          <Link
            href="https://www.linkedin.com/in/louistrue"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Louis Trümper's LinkedIn profile"
            className="hidden lg:inline transition-colors hover:text-primary hover:underline"
          >
            Louis Trümper
          </Link>
        </div>

        <div className="text-center lg:text-right">
          <span className="text-muted-foreground">© {year} </span>
          <Link
            href="https://www.gnu.org/licenses/agpl-3.0.en.html"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Read the AGPL license"
            className="font-medium transition-colors hover:text-primary hover:underline"
          >
            AGPL-3.0
          </Link>
          <span className="text-muted-foreground"> licensed</span>
        </div>
      </div>

    </footer>
  )
}

