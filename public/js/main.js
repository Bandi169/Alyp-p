/* ==========================================================================
   Aly P&P Healthy Drink - application script
   --------------------------------------------------------------------------
   Orders are placed over WhatsApp: each product card opens a chat with the
   message pre-filled. There is no cart or online payment step.
   The contact form posts to Formspree.
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------------
     Configuration
     ---------------------------------------------------------------------- */

  const CONFIG = {
    formspreeFormId: "mwvrazgv",
    notifyEmail: "peteralli479@gmail.com",
    // International format, digits only - required by the wa.me link format.
    whatsappNumber: "2348063838960",
    supportPhone: "0806-383-8960",
  };

  const FORMSPREE_ENDPOINT = `https://formspree.io/f/${CONFIG.formspreeFormId}`;

  // Local stand-in when a product image fails to load, so a broken card
  // never depends on a third-party placeholder service.
  const IMAGE_FALLBACK =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23DC143C'/%3E%3Ctext x='150' y='158' font-family='sans-serif' font-size='20' fill='%23fff' text-anchor='middle'%3EAly P%26amp;P%3C/text%3E%3C/svg%3E";

  /* ------------------------------------------------------------------------
     Product catalogue
     ---------------------------------------------------------------------- */

  const products = [
    {
      id: 1,
      name: "Single Bottle",
      size: "50cl",
      price: 500,
      description: "Perfect for personal refreshment",
      image: "images/50cl.png",
      badge: "Popular",
    },
    {
      id: 2,
      name: "Large Bottle",
      size: "1 Litre",
      price: 1500,
      description: "Share with friends and family",
      image: "images/75cl.png",
      badge: null,
    },
    {
      id: 3,
      name: "Party Keg",
      size: "5 Litres",
      price: 5000,
      description: "Perfect for large gatherings",
      image: "images/5ltrs2.png",
      badge: "Event Special",
    },
    {
      id: 4,
      name: "Bulk Order",
      size: "Custom",
      price: 0,
      description: "Contact us for wholesale pricing",
      image: "images/bulk.png",
      badge: "Wholesale",
      custom: true,
    },
  ];

  /* ------------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */

  const $ = (id) => document.getElementById(id);
  const naira = (value) => `₦${value.toLocaleString()}`;

  const WHATSAPP_ICON =
    '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  // Builds the wa.me deep link with the order message pre-filled.
  function whatsappLink(product) {
    const message = product.custom
      ? "Hello Aly P&P! I would like a quote for a bulk / wholesale order of your Zobo drink."
      : `Hello Aly P&P! I would like to order the ${product.name} (${product.size}) - ${naira(product.price)}.`;

    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  /* ------------------------------------------------------------------------
     Product grid
     ---------------------------------------------------------------------- */

  function renderProducts() {
    const grid = $("productGrid");
    if (!grid) return;

    grid.innerHTML = products
      .map((product) => {
        const badge = product.badge
          ? `<div class="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">${product.badge}</div>`
          : "";

        const price = product.custom
          ? '<span class="text-2xl font-black text-red-600">Custom</span>'
          : `<span class="text-2xl font-black text-red-600">${naira(product.price)}</span>`;

        const label = product.custom ? "Request a Quote" : "Order on WhatsApp";

        return `
          <div class="product-card bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative group">
            ${badge}
            <div class="relative h-64 overflow-hidden bg-gradient-to-b from-red-50 to-white">
              <img src="${product.image}" alt="${product.name} - ${product.size} Aly P&amp;P Zobo drink" loading="lazy" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" data-fallback>
            </div>
            <div class="p-6">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">${product.name}</h3>
                  <p class="text-sm text-gray-500">${product.size}</p>
                </div>
                <div class="text-right">${price}</div>
              </div>
              <p class="text-gray-600 text-sm mb-6">${product.description}</p>
              <a href="${whatsappLink(product)}" target="_blank" rel="noopener" class="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2">${WHATSAPP_ICON}${label}</a>
            </div>
          </div>`;
      })
      .join("");
  }

  /* ------------------------------------------------------------------------
     Contact form
     ---------------------------------------------------------------------- */

  async function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const status = $("contactStatus");
    const button = form.querySelector('button[type="submit"]');
    const data = new FormData(form);

    if (status) {
      status.textContent = "Sending your message...";
      status.className = "text-sm text-gray-600";
    }
    if (button) button.disabled = true;

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: CONFIG.notifyEmail,
          subject: "New Contact Enquiry - Aly P&P",
          message: [
            "NEW CONTACT ENQUIRY",
            "",
            `Name: ${data.get("name")}`,
            `Phone: ${data.get("phone")}`,
            "",
            "Message:",
            data.get("message"),
            "",
            `Received: ${new Date().toLocaleString()}`,
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        throw new Error(`Formspree responded ${response.status}`);
      }

      form.reset();
      if (status) {
        status.textContent = "Thanks! Your message is on its way.";
        status.className = "text-sm font-semibold text-green-700";
      }
    } catch (error) {
      console.error("Contact form error:", error);
      if (status) {
        status.textContent = `Sorry, that did not send. Please call ${CONFIG.supportPhone} instead.`;
        status.className = "text-sm font-semibold text-red-700";
      }
    } finally {
      if (button) button.disabled = false;
    }
  }

  /* ------------------------------------------------------------------------
     Misc UI
     ---------------------------------------------------------------------- */

  function scrollToSection(id) {
    $(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function applyImageFallbacks(root) {
    root.querySelectorAll("img[data-fallback]").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          img.src = IMAGE_FALLBACK;
        },
        { once: true },
      );
    });
  }

  /* ------------------------------------------------------------------------
     Event wiring
     ---------------------------------------------------------------------- */

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest('[data-action="scroll-to"]');
    if (trigger) scrollToSection(trigger.dataset.target);
  });

  document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    applyImageFallbacks(document);

    $("contactForm")?.addEventListener("submit", handleContactSubmit);
  });
})();
