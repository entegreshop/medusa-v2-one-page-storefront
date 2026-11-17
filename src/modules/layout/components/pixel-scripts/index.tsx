import PixelRouteTracker from "./route-tracker"
import { Suspense } from "react"

export async function fetchStorePixelConfig() {
  try {
    const backendUrl =
      process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      "https://api.cizgibutik.com"
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    const headers: Record<string, string> = {}
    if (publishableKey) {
      headers["x-publishable-api-key"] = publishableKey
    }

    const res = await fetch(`${backendUrl}/store/pixel-settings`, {
      cache: "no-store",
      headers,
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.config) {
        return data.config
      }
    }
  } catch (e) {
    console.error("Error loading pixel settings on storefront:", e)
  }

  return {
    meta_pixel: {
      active: true,
      pixel_id: "538418662598444",
      access_token: "",
    },
  }
}

export default async function PixelScripts() {
  const config = await fetchStorePixelConfig()
  if (!config) return null

  const {
    search_engines,
    meta_pixel,
    google_ads,
    google_analytics,
    google_tag_manager,
    tiktok_pixel,
    yandex_metrica,
    openai_ads,
    custom_scripts,
  } = config

  const metaPixelId = (meta_pixel?.pixel_id || "").trim()
  const isMetaActive = meta_pixel?.active !== false && Boolean(metaPixelId)

  const gaMeasurementId = (google_analytics?.measurement_id || "").trim()
  const isGaActive = Boolean(google_analytics?.active && gaMeasurementId)

  const gtmId = (google_tag_manager?.gtm_id || "").trim()
  const isGtmActive = Boolean(google_tag_manager?.active && gtmId)

  const tiktokId = (tiktok_pixel?.pixel_id || "").trim()
  const isTiktokActive = Boolean(tiktok_pixel?.active && tiktokId)

  const gAdsId = (google_ads?.conversion_id || "").trim()
  const isGAdsActive = Boolean(google_ads?.active && gAdsId)

  const yandexId = (yandex_metrica?.counter_id || "").trim()
  const isYandexActive = Boolean(yandex_metrica?.active && yandexId)

  const openAiId = (openai_ads?.pixel_id || "").trim()
  const isOpenAiActive = Boolean(openai_ads?.active && openAiId)

  return (
    <>
      {/* Dynamic Navigation & PageView Tracker */}
      <Suspense fallback={null}>
        <PixelRouteTracker config={config} />
      </Suspense>

      {/* 0. Search Engine Domain Verification Meta Tags (Fallback inline render) */}
      {search_engines?.active !== false && (
        <>
          {search_engines?.google_verification && (
            <meta name="google-site-verification" content={search_engines.google_verification} />
          )}
          {search_engines?.facebook_verification && (
            <meta name="facebook-domain-verification" content={search_engines.facebook_verification} />
          )}
          {search_engines?.yandex_verification && (
            <meta name="yandex-verification" content={search_engines.yandex_verification} />
          )}
          {search_engines?.bing_verification && (
            <meta name="msvalidate.01" content={search_engines.bing_verification} />
          )}
          {search_engines?.pinterest_verification && (
            <meta name="p:domain_verify" content={search_engines.pinterest_verification} />
          )}
        </>
      )}

      {/* 1. Meta (Facebook & Instagram) Pixel */}
      {isMetaActive && (
        <>
          <script
            id="fb-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt="meta-pixel-noscript"
            />
          </noscript>
        </>
      )}

      {/* 2. Google Analytics (GA4) */}
      {isGaActive && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          />
          <script
            id="ga4-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { send_page_view: true });
              `,
            }}
          />
        </>
      )}

      {/* 3. Google Tag Manager */}
      {isGtmActive && (
        <>
          <script
            id="gtm-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm-noscript"
            />
          </noscript>
        </>
      )}

      {/* 4. TikTok Pixel */}
      {isTiktokActive && (
        <script
          id="tiktok-pixel"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var e=0;e<ttq.methods.length;e++)ttq.setAndDefer(ttq,ttq.methods[e]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.mixpool;w[t].type="use_cookie",w[t].enableSdk=1,w[t].instances=n&&n.instances||[];var i=d.createElement("script");i.type="text/javascript",i.async=!0,i.src=r;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};
                ttq.load('${tiktokId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {/* 5. Google Ads Conversion Pixel */}
      {isGAdsActive && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gAdsId}`}
          />
          <script
            id="google-ads-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gAdsId}');
                window.__GOOGLE_ADS_CONFIG__ = ${JSON.stringify({
                  conversion_id: gAdsId,
                  conversion_label: google_ads?.conversion_label || "",
                })};
              `,
            }}
          />
        </>
      )}

      {/* 6. Yandex Metrika */}
      {isYandexActive && (
        <>
          <script
            id="yandex-metrica-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
                ym(${JSON.stringify(yandexId)}, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:${yandex_metrica?.webvisor !== false ? "true" : "false"},
                  ecommerce:"dataLayer"
                });
              `,
            }}
          />
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${yandexId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {/* 7. OpenAI Ads / Search Tracking */}
      {isOpenAiActive && (
        <script
          id="openai-ads-pixel"
          dangerouslySetInnerHTML={{
            __html: `window.__OPENAI_PIXEL_ID__ = ${JSON.stringify(openAiId)};`,
          }}
        />
      )}

      {/* 8. Custom Head & Body Scripts */}
      {custom_scripts?.active !== false && custom_scripts?.head_scripts && (
        <div
          id="custom-head-scripts"
          dangerouslySetInnerHTML={{ __html: custom_scripts.head_scripts }}
        />
      )}
      {custom_scripts?.active !== false && custom_scripts?.body_start_scripts && (
        <div
          id="custom-body-start-scripts"
          dangerouslySetInnerHTML={{ __html: custom_scripts.body_start_scripts }}
        />
      )}
      {custom_scripts?.active !== false && custom_scripts?.body_end_scripts && (
        <div
          id="custom-body-end-scripts"
          dangerouslySetInnerHTML={{ __html: custom_scripts.body_end_scripts }}
        />
      )}
    </>
  )
}
