import React, { useState } from "react";
import { PricingCard as PricingCardUI } from "@prodgenie/libs/ui";
import { useAuthStore } from "@prodgenie/libs/store";
import { cn } from "@prodgenie/libs/utils";

import handleCheckout from "./HandleCheckout";

const PricingCard = ({ variant = "page" }: { variant?: "page" | "modal" }) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const { setAuthType } = useAuthStore();
  const handleClick = () => setAuthType("signup");

  // ✅ Plan definitions in one place
  const plans = [
    {
      id: "free",
      title: "Free",
      price: 0,
      features: [
        "Up to 50 job cards / month",
        "Basic drawing import",
        "Email support",
      ],
    },
    {
      id: "starter",
      title: "Starter",
      price: 99,
      features: [
        "Up to 500 job cards / month",
        "BOM extraction",
        "Standard integrations",
        "Priority email support",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise",
      price: 299,
      features: [
        "Unlimited job cards",
        "Custom workflows & API access",
        "Dedicated account manager",
        "24/7 phone support",
      ],
    },
  ];

  const computePrice = (base: number) =>
    billingCycle === "monthly" ? base : base * 10;

  return (
    <section
      className={cn(
        "bg-muted/50",
        variant === "page" && "py-20",
        variant === "modal" && "p-4 max-h-[70vh] overflow-y-auto rounded-lg"
      )}
    >
      <div
        className={cn(
          "mx-auto text-center",
          variant === "page" ? "container px-4" : ""
        )}
      >
        <h2
          className={cn(
            "font-bold mb-6",
            variant === "page" ? "text-3xl" : "text-xl"
          )}
        >
          Choose Your Plan
        </h2>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex rounded-lg bg-white p-1 mb-8">
          {(["monthly", "annual"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm transition",
                billingCycle === cycle
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {cycle === "monthly" ? "Monthly" : "Annual (2 months free)"}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
          {plans.map((plan) => (
            <PricingCardUI
              key={plan.id}
              title={plan.title}
              price={computePrice(plan.price)}
              cycle={billingCycle}
              features={plan.features}
              onClick={plan.price === 0 ? handleClick : handleCheckout}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCard;
