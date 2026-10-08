
import { store } from '../store.js';
import { renderNavbar, renderFooter } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('promotions');
  renderFooter();

  const promotionsGrid = document.getElementById('promotions-grid');

  const API_URL = 'http://localhost:8080/api/promotions';
  const FALLBACK_IMAGE = 'images/luxury-complex-marina.jpg';

  if (!promotionsGrid) return;

  // Prevent HTML injection from backend data
  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Convert backend dates to local dates
  function parseLocalDate(dateString) {
    if (!dateString) return null;

    const parts = String(dateString).split('-');

    if (parts.length !== 3) return null;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Display readable date
  function formatDate(dateString) {
    const date = parseLocalDate(dateString);

    if (!date) return 'Limited Time';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Validate banner image URL
  function getBannerImage(url) {
    if (!url || !String(url).trim()) {
      return FALLBACK_IMAGE;
    }

    const imageURL = String(url).trim();

    try {
      const parsedURL = new URL(imageURL, window.location.href);

      if (
        parsedURL.protocol !== 'http:' &&
        parsedURL.protocol !== 'https:'
      ) {
        return FALLBACK_IMAGE;
      }

      return parsedURL.href;
    } catch {
      return FALLBACK_IMAGE;
    }
  }

  // Show loading state
  function showLoading() {
    promotionsGrid.innerHTML = `
      <p
        style="
          grid-column: 1 / -1;
          text-align: center;
          color: var(--text-muted);
          padding: 3rem;
        "
      >
        Loading promotions...
      </p>
    `;
  }

  // Check whether a promotion is currently active
  function isActivePromotion(promo, today) {
    const status = String(promo.status || '').toUpperCase();

    if (
      status === 'INACTIVE' ||
      status === 'SCHEDULED' ||
      status === 'EXPIRED'
    ) {
      return false;
    }

    const startDate = parseLocalDate(promo.startDate);
    const endDate = parseLocalDate(promo.endDate);

    if (!startDate || !endDate) {
      return false;
    }

    return today >= startDate && today <= endDate;
  }

  // Render a single promotion card
  function createPromotionCard(promo) {
    const title = escapeHTML(
      promo.promotionTitle || 'Special Promotion'
    );

    const type = escapeHTML(
      promo.promotionType || 'Special Offer'
    );

    const description = escapeHTML(promo.about || '');

    const criteria = escapeHTML(
      promo.eligibilityCriteria || 'All residences'
    );

    const promoCode = escapeHTML(
      promo.promotionCode || 'LIVINGORA'
    );

    const bannerImage = escapeHTML(
      getBannerImage(promo.bannerImage)
    );

    const discount = Number(promo.discountPrecentage);

    const hasDiscount =
      promo.discountPrecentage !== null &&
      promo.discountPrecentage !== undefined &&
      promo.discountPrecentage !== '' &&
      Number.isFinite(discount) &&
      discount > 0;

    const buttonText = escapeHTML(promo.buttonText || '');

    return `
      <article class="card promotion-card">

        <!-- Promotion Banner Image -->
        <div class="card-img-wrap promotion-image-wrapper">

          <img
            src="${bannerImage}"
            alt="${title}"
            class="card-img promotion-image"
            loading="lazy"
            decoding="async"
          />

          <div class="card-badge-pos">
            <span class="badge badge-gold">
              ${type}
            </span>
          </div>

        </div>

        <!-- Promotion Information -->
        <div class="card-body promotion-card-body">

          <h3 class="card-title promotion-title">
            ${title}
          </h3>

          <p class="promotion-description">
            ${description}
          </p>

          <!-- Promotion Metadata -->
          <div class="card-meta promotion-meta">

            <span>
              &#128203;
              <strong>Criteria:</strong>
              ${criteria}
            </span>

            <span>
              &#128197;
              <strong>Valid Till:</strong>
              ${formatDate(promo.endDate)}
            </span>

          </div>

          <!-- Discount Percentage -->
          ${
            hasDiscount
              ? `
                <div class="promotion-discount">
                  <strong>
                    ${escapeHTML(discount)}% OFF
                  </strong>
                </div>
              `
              : ''
          }

          <!-- Promotion Code -->
          <div class="card-footer promotion-footer">

            <div class="promotion-code-info">

              <small>
                Promo Code
              </small>

              <strong>
                ${promoCode}
              </strong>

            </div>

            <button
              type="button"
              class="btn btn-sm btn-outline copy-code-btn"
              data-code="${promoCode}"
            >
              &#128203; Copy Code
            </button>

          </div>

          <!-- Call to Action -->
          ${
            buttonText
              ? `
                <a
                  href="apartments.html"
                  class="btn btn-primary btn-block promotion-action"
                >
                  ${buttonText}
                </a>
              `
              : ''
          }

        </div>

      </article>
    `;
  }

  // Initialize image error handling
  function setupImageFallbacks() {
    promotionsGrid.querySelectorAll('.promotion-image')
      .forEach(image => {
        image.addEventListener('error', () => {
          if (image.dataset.fallbackApplied === 'true') {
            return;
          }

          image.dataset.fallbackApplied = 'true';
          image.src = FALLBACK_IMAGE;
        });
      });
  }

  // Copy promotion code
  function setupCopyButtons() {
    promotionsGrid.querySelectorAll('.copy-code-btn')
      .forEach(button => {
        button.addEventListener('click', async () => {
          const code = button.dataset.code;

          if (!code) return;

          try {
            await navigator.clipboard.writeText(code);

            const originalText = button.innerHTML;

            button.innerHTML = '&#10003; Copied!';

            button.classList.remove('btn-outline');
            button.classList.add('btn-success');

            setTimeout(() => {
              button.innerHTML = originalText;

              button.classList.remove('btn-success');
              button.classList.add('btn-outline');
            }, 2000);

          } catch (error) {
            window.prompt('Copy this promotion code:', code);
          }
        });
      });
  }

  // Load promotions from backend
  async function renderPromotions() {
    showLoading();

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch promotions: HTTP ${response.status}`
        );
      }

      const allPromos = await response.json();

      if (!Array.isArray(allPromos)) {
        throw new Error('Invalid promotions API response');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activePromos = allPromos.filter(promo =>
        isActivePromotion(promo, today)
      );

      if (activePromos.length === 0) {
        promotionsGrid.innerHTML = `
          <p class="promotion-empty">
            No active promotions at this time.
          </p>
        `;
        return;
      }

      promotionsGrid.innerHTML = activePromos
        .map(createPromotionCard)
        .join('');

      setupImageFallbacks();
      setupCopyButtons();

    } catch (error) {
      console.error('[Promotions] Error:', error);

      promotionsGrid.innerHTML = `
        <div class="promotion-error">
          <p>
            Unable to load promotions.
            Please try again later.
          </p>

          <button
            type="button"
            class="btn btn-outline retry-promotions-btn"
          >
            Try Again
          </button>
        </div>
      `;

      const retryButton = promotionsGrid.querySelector(
        '.retry-promotions-btn'
      );

      if (retryButton) {
        retryButton.addEventListener('click', renderPromotions);
      }
    }
  }

  renderPromotions();
});
