/**
 * Helper utility to parse and validate Google Review links, Place IDs, and Maps URLs.
 * Automatically generates direct write-review links (https://search.google.com/local/writereview?placeid=...
 * or https://g.page/r/.../review) from any copied Google link or Place ID.
 */

export interface ParsedGoogleReview {
  placeId: string;
  isFullUrl: boolean;
  cleanUrl: string;
  directReviewUrl: string;
  extractedBizName?: string;
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
      detectedType: 'unknown',
      label: 'Belum diisi',
    };
  }

  // 1. Direct Place ID starting with ChIJ or plain alphanumeric without protocol
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.includes('/')) {
    const cleanId = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
    const directUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cleanId)}`;
    return {
      placeId: cleanId,
      isFullUrl: false,
      cleanUrl: directUrl,
      directReviewUrl: directUrl,
      detectedType: 'place_id',
      label: 'Google Place ID Resmi (ChIJ...)',
    };
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);

    // Try extracting business name from Google Maps path (e.g. /maps/place/Kopi+Kenangan+-+Senopati/...)
    let extractedBizName: string | undefined;
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
        detectedType: 'maps_url',
        label: 'Tautan Google Maps (Berhasil Dikonversi ke Form Ulasan Langsung)',
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
        detectedType: 'maps_short_url',
        label: 'Tautan Bagikan Google Maps (Shortlink)',
      };
    }

    // 6. Generic Maps / Google URL
    return {
      placeId: trimmed,
      isFullUrl: true,
      cleanUrl: trimmed,
      directReviewUrl: trimmed,
      extractedBizName,
      detectedType: 'raw_url',
      label: 'Tautan Ulasan Google',
    };
  } catch {
    // If not a URL, check for ChIJ regex
    const matchChIJ = trimmed.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
    if (matchChIJ && matchChIJ[1]) {
      const placeId = matchChIJ[1];
      const directUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
      return {
        placeId,
        isFullUrl: false,
        cleanUrl: directUrl,
        directReviewUrl: directUrl,
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
      detectedType: 'unknown',
      label: 'Format Tautan Kustom',
    };
  }
}
