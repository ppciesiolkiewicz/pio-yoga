"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { cn } from "../cn";
import { buttonClasses } from "./Button";
import { ColorModeSwitch, type ColorModeLabels } from "./ColorModeSwitch";
import { NavLinks, type NavItem } from "./NavLinks";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function MobileMenu({
  items,
  buckets,
  cta,
  labels,
  newTabLabel,
}: {
  items: NavItem[];
  buckets: readonly string[];
  cta: CtaLink;
  labels: { menu: string; close: string; colorMode: ColorModeLabels };
  newTabLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={cn(buttonClasses("secondary"), "lg:hidden")}>
          {labels.menu}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,100vw)] flex-col gap-6 overflow-y-auto border-l-2 border-line bg-bg p-6 text-ink"
        >
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="font-display text-xl font-extrabold">{labels.menu}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className={buttonClasses("secondary")}>
                {labels.close}
              </button>
            </Dialog.Close>
          </div>
          <nav aria-label={labels.menu}>
            <NavLinks items={items} buckets={buckets} orientation="vertical" onNavigate={() => setOpen(false)} />
          </nav>
          <ColorModeSwitch labels={labels.colorMode} />
          <ButtonLink link={{ ...cta, trackLocation: "mobile_menu" }} newTabLabel={newTabLabel} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
