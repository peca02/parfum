import Form from "next/form";
import { PiArrowRightBold } from "react-icons/pi";

const fields = [
  {
    id: "checkout-name",
    label: "Full name",
    type: "text",
    autoComplete: "shipping name",
  },
  { id: "checkout-email", label: "Email", type: "email", autoComplete: "email" },
  {
    id: "checkout-address",
    label: "Shipping address",
    type: "text",
    autoComplete: "shipping address-line1",
  },
];

const focusStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-night-foreground";

// The title and the form are separate, so the buy section can line the title up with its heading.
export function CheckoutForm() {
  return (
    <>
      <h3
        id="checkout-heading"
        data-buy-reveal
        className="text-lead font-bold uppercase"
      >
        Your details
      </h3>

      {/* The fields have no name, so nothing the visitor types is added to the URL or sent anywhere.
          noValidate lets the demo continue to the payment notice whatever is typed.
          The form stretches to the height of the screenshot beside it and spreads its fields evenly. */}
      <Form
        action="/payment"
        noValidate
        aria-labelledby="checkout-heading"
        className="flex flex-col justify-between gap-5 self-stretch"
      >
        {fields.map((field) => (
          <div key={field.id} data-buy-reveal className="flex flex-col gap-2">
            <label
              htmlFor={field.id}
              className="text-sm font-semibold tracking-widest text-night-muted uppercase"
            >
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              className={`rounded-full border border-night-foreground/25 bg-transparent px-6 py-3 text-lg text-night-foreground transition-colors hover:border-night-foreground/50 focus:border-night-foreground ${focusStyles}`}
            />
          </div>
        ))}

        <button
          type="submit"
          data-buy-reveal
          className={`mt-2 flex items-center justify-center gap-3 rounded-full bg-night-foreground px-8 py-4 text-lg font-bold text-night uppercase transition-colors hover:bg-night-foreground/85 ${focusStyles}`}
        >
          Continue to payment
          <PiArrowRightBold aria-hidden="true" className="size-5" />
        </button>
      </Form>
    </>
  );
}
