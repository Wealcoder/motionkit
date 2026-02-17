import React, { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CustomerSupportIcon } from "@hugeicons/core-free-icons";

import HelpDialogHeader from "@/components/common/HelpDialogHeader";
import HelpDialogSearchSection from "@/components/common/HelpDialogSearchSection";
import { BubbleChatQuestionIcon } from "@hugeicons/core-free-icons/index";

/* Dummy FAQ Data */

const faqData = [
  {
    question: "What is Animation Builder and how does it work?",
    answer:
      "Animation Builder is a visual animation system that allows you to create advanced motion effects without writing code.",
  },
  {
    question: "Can I create animations without writing code?",
    answer:
      "Yes. All animations can be created using a visual interface with simple controls like duration, delay, and easing.",
  },
  {
    question: "Does Animation Builder work on mobile and tablet devices?",
    answer:
      "Yes. All animations are fully responsive and optimized for desktop, tablet, and mobile devices.",
  },
  {
    question: "Will animations slow down my website?",
    answer:
      "No. The system is performance-optimized and uses hardware-accelerated properties for smooth rendering.",
  },
  {
    question: "Does it support scroll-based animations?",
    answer:
      "Yes. You can create advanced scroll-triggered animations with full control over timing and sequencing.",
  },
];

const FAQModal = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");

  /* Filter FAQs */
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqData;

    return faqData.filter((item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1019px] min-h-[702px] max-h-[702px] bg-[#18181B] p-0 [&>button]:hidden !block">
        {/* Header */}
        <HelpDialogHeader title="FAQ" />

        {/* Body */}
        <div className="px-16 pt-10 pb-16">
          {/* Section Title */}
          <div className="flex flex-col gap-3 items-center w-[443px] mx-auto">
            <h2 className="text-2xl font-semibold leading-5 tracking-normal text-[#FAFAFA] m-0">
              Popular Queries
            </h2>
            <p className="text-xs font-normal text-center text-[#A1A1AA] leading-5 tracking-normal m-0">
              A curated collection of the most frequently asked questions,
              common use cases, and real-world scenarios from our users.
            </p>
          </div>

          {/* Search */}
          <div className="[&>div]:w-[450px] mt-[31px]">
            <HelpDialogSearchSection
            placeholder="Search faq"
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-[769px] max-h-[244px] mx-auto mt-[43px] overflow-y-auto">
            <Accordion type="single" className="gap-4" collapsible>
              {filteredFaqs.map((faq, index) => (
                <div className="flex flex-col gap-2.5">
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-none [&_h3]:m-0"
                  >
                    <AccordionTrigger className="h-[31px] text-left text-xs font-medium leading-5 tracking-normal bg-transparent font-inter text-[#FAFAFA] border-none cursor-pointer hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[11.5px] font-normal leading-4.5 tracking-normal text-[#E4E4E7] pb-0">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                  <div className="w-full h-[1px] bg-[#303033]" />
                </div>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <p className="text-center text-[#71717A] mt-6">
                No results found.
              </p>
            )}
          </div>

          {/* Bottom CTA Section */}
          <div className="mt-10 bg-[#1F1F23] rounded-[10px] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                icon={BubbleChatQuestionIcon}
                size={36}
                color="currentColor"
                strokeWidth={1.5}
                className="text-[#E4E4E7]"
              />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium leading-5 tracking-normal text-white  m-0">
                  Still have a question
                </p>
                <p className="text-xs font-normal leading-5 tracking-normal text-[#E4E4E7] m-0">
                  Didn’t see your question answered above? Contact our support
                  team for personalized help and detailed guidance.
                </p>
              </div>
            </div>

            <Button className="bg-[#2C76E6] text-[#FAFAFA] text-xs font-medium leading-5 tracking-normal px-3 py-1 h-7 cursor-pointer rounded-5 border-none">
              Contact Us
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FAQModal;
