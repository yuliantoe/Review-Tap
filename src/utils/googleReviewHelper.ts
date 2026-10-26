/**
 * Helper utility to parse and validate Google Review links, Google Maps URLs, and Place IDs.
 * Automatically converts any Google Maps link into a direct write-review link
 * (https://search.google.com/local/writereview?placeid=... or direct review link)
 * and extracts the Business Name automatically.
 */

export interface ParsedGoogleReview {
  placeId: string;
  isFullUrl: boolean;
  cleanUrl: string;
  directReviewUrl: string;
  extractedBizName?: string;
  isGoogleMapsUrl: boolean;
  detectedType: 'place_id' | 'writereview_url' | 'g_page_url' | 'maps_url' | 'maps_short_url' | 'raw_url' | 'unknown';
  label: string;
}

export function parseGoogleReviewInput(input: string): ParsedGoogleReview {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      placeId: '',
      isFullUrl: false,
      cleanUrl: '',
      directReviewUrl: '',
      isGoogleMapsUrl: false,
      detectedType: 'unknown',
      label: 'Belum diisi',
    };
  }

  // 1. Direct Place ID starting with ChIJ or plain alphanumeric without protocol
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.includes('/') && !trimmed.includes('.')) {
    const cleanId = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
    const directUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cleanId)}`;
    return {
      placeId: cleanId,
      isFullUrl: false,
      cleanUrl: directUrl,
      directReviewUrl: directUrl,
      isGoogleMapsUrl: false,
      detectedType: 'place_id',
      label: 'Google Place ID Resmi (ChIJ...)',
    };
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const isMapsDomain = url.hostname.includes('google.com') || url.hostname.includes('maps.app.goo.gl') || url.hostname.includes('goo.gl') || url.hostname.includes('g.page');

    // Try extracting business name from Google Maps path or query
    let extractedBizName: string | undefined;

    // Pattern 1: /maps/place/Nama+Bisnis/...
    const placePathMatch = url.pathname.match(/\/maps\/place\/([^\/@?#]+)/i);
    if (placePathMatch && placePathMatch[1]) {
      try {
        const decoded = decodeURIComponent(placePathMatch[1].replace(/\+/g, ' '));
        if (decoded && decoded.trim() && !decoded.startsWith('@')) {
          extractedBizName = decoded.trim();
        }
      } catch {
        // ignore
      }
    }

    // Pattern 2: /maps/search/Nama+Bisnis/...
    if (!extractedBizName) {
      const searchPathMatch = url.pathname.match(/\/maps\/search\/([^\/@?#]+)/i);
      if (searchPathMatch && searchPathMatch[1]) {
        try {
          const decoded = decodeURIComponent(searchPathMatch[1].replace(/\+/g, ' '));
          if (decoded && decoded.trim() && !decoded.startsWith('@')) {
            extractedBizName = decoded.trim();
          }
        } catch {
          // ignore
        }
      }
    }

    // Pattern 3: ?q=Nama+Bisnis or ?query=...
    if (!extractedBizName) {
      const qParam = url.searchParams.get('q') || url.searchParams.get('query');
      if (qParam && qParam.trim() && !qParam.includes(',') && !qParam.match(/^[-0-9.,\s]+$/)) {
        try {
          extractedBizName = decodeURIComponent(qParam.replace(/\+/g, ' ')).trim();
        } catch {
          // ignore
        }
      }
    }

    // 2. Google Write Review URL: search.google.com/local/writereview?placeid=...
    const placeIdParam = url.searchParams.get('placeid') || url.searchParams.get('place_id');
    if (placeIdParam) {
      const directUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeIdParam)}`;
      return {
        placeId: placeIdParam,
        isFullUrl: false,
        cleanUrl: directUrl,
        directReviewUrl: directUrl,
        extractedBizName,
        isGoogleMapsUrl: true,
        detectedType: 'writereview_url',
        label: 'Tautan Resmi Google Write Review (Place ID Diekstrak)',
      };
    }

    // 3. g.page short link (e.g. https://g.page/r/Cd-6qT8tZ-B4EBM/review)
    if (url.hostname.includes('g.page')) {
      const directUrl = trimmed.includes('/review')
        ? trimmed
        : `${trimmed.replace(/\/$/, '')}/review`;
      return {
        placeId: directUrl,
        isFullUrl: true,
        cleanUrl: directUrl,
        directReviewUrl: directUrl,
        extractedBizName,
        isGoogleMapsUrl: true,
        detectedType: 'g_page_url',
        label: 'Tautan Google Review Langsung (g.page/.../review)',
      };
    }

    // 4. Embedded ChIJ place ID in URL string (e.g. Google Maps long URLs, search URLs)
    const matchChIJ = trimmed.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
    if (matchChIJ && matchChIJ[1]) {
      const placeId = matchChIJ[1];
      const directUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
      return {
        placeId,
        isFullUrl: false,
        cleanUrl: directUrl,
        directReviewUrl: directUrl,
        extractedBizName,
        isGoogleMapsUrl: true,
        detectedType: 'maps_url',
        label: 'Tautan Google Maps Terkonversi ke Google Review Langsung',
      };
    }

    // 5. Short links like maps.app.goo.gl or goo.gl/maps
    if (url.hostname.includes('maps.app.goo.gl') || url.hostname.includes('goo.gl')) {
      return {
        placeId: trimmed,
        isFullUrl: true,
        cleanUrl: trimmed,
        directReviewUrl: trimmed,
        extractedBizName,
        isGoogleMapsUrl: true,
        detectedType: 'maps_short_url',
        label: 'Tautan Bagikan Google Maps (Terkonversi ke Review)',
      };
    }

    // 6. Generic Maps / Google URL
    return {
      placeId: trimmed,
      isFullUrl: true,
      cleanUrl: trimmed,
      directReviewUrl: trimmed,
      extractedBizName,
      isGoogleMapsUrl: isMapsDomain,
      detectedType: 'raw_url',
      label: isMapsDomain ? 'Tautan Google Maps Terkonversi' : 'Tautan Ulasan Google',
    };
  } catch {
    // If not a standard URL, check for ChIJ regex
    const matchChIJ = trimmed.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
    if (matchChIJ && matchChIJ[1]) {
      const placeId = matchChIJ[1];
      const directUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
      return {
        placeId,
        isFullUrl: false,
        cleanUrl: directUrl,
        directReviewUrl: directUrl,
        isGoogleMapsUrl: true,
        detectedType: 'place_id',
        label: 'Google Place ID Terdeteksi (Form Ulasan Langsung)',
      };
    }

    const fallbackDirect = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(trimmed)}`;
    return {
      placeId: trimmed,
      isFullUrl: false,
      cleanUrl: fallbackDirect,
      directReviewUrl: fallbackDirect,
      isGoogleMapsUrl: false,
      detectedType: 'unknown',
      label: 'Format Tautan Kustom',
    };
  }
}

/**
 * Normalizes Indonesian and international WhatsApp phone numbers.
 * Converts 0812... to 62812..., strips dashes/spaces.
 */
export function formatWhatsAppNumber(rawNumber: string): {
  cleanNumber: string;
  displayNumber: string;
  waLink: string;
  isValid: boolean;
} {
  const digits = rawNumber.replace(/[^0-9]/g, '');
  if (!digits || digits.length < 9) {
    return {
      cleanNumber: '',
      displayNumber: rawNumber,
      waLink: '',
      isValid: false,
    };
  }

  let normalized = digits;
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.substring(1);
  } else if (normalized.startsWith('8')) {
    normalized = '62' + normalized;
  }

  const isValid = normalized.length >= 10 && normalized.length <= 15;
  const waLink = isValid ? `https://wa.me/${normalized}` : '';

  // Format for display e.g. +62 812-3456-7890
  let displayNumber = '+' + normalized;
  if (normalized.startsWith('62') && normalized.length >= 11) {
    displayNumber = `+62 ${normalized.substring(2, 5)}-${normalized.substring(5, 9)}-${normalized.substring(9)}`;
  }

  return {
    cleanNumber: normalized,
    displayNumber,
    waLink,
    isValid,
  };
}
