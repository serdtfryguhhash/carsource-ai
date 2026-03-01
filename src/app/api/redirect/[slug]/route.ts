import { NextRequest, NextResponse } from "next/server";

const affiliateLinks: Record<string, string> = {
  "kn-filters": "https://www.knfilters.com",
  "borla": "https://www.borla.com",
  "kw-suspension": "https://www.kwsuspensions.com",
  "brembo": "https://www.brembo.com",
  "mishimoto": "https://www.mishimoto.com",
  "hks": "https://www.hks-power.co.jp/en",
  "cobb": "https://www.cobbtuning.com",
  "invidia": "https://www.invidia.com",
  "tomei": "https://www.tomeiusa.com",
  "magnaflow": "https://www.magnaflow.com",
  "akrapovic": "https://www.akrapovic.com",
  "awe": "https://www.awe-tuning.com",
  "eibach": "https://www.eibach.com",
  "bc-racing": "https://www.bcracing.com",
  "bilstein": "https://www.bilstein.com",
  "enkei": "https://www.enkei.com",
  "volk": "https://www.rays-g.co.jp",
  "hondata": "https://www.hondata.com",
  "apr": "https://www.goapr.com",
  "mhd": "https://www.mhdtuning.com",
  "hp-tuners": "https://www.hptuners.com",
  "diablo-sport": "https://www.diablosport.com",
  "ecutek": "https://www.ecutek.com",
  "garrett": "https://www.garrettmotion.com",
  "precision-turbo": "https://www.precisionturbo.net",
  "whipple": "https://www.whipplesuperchargers.com",
  "procharger": "https://www.procharger.com",
  "sparco": "https://www.sparco-official.com",
  "recaro": "https://www.recaro-automotive.com",
  "seibon": "https://www.seibon.com",
  "stoptech": "https://www.stoptech.com",
  "ebc-brakes": "https://www.ebcbrakes.com",
  "amazon-auto": "https://www.amazon.com/automotive",
  "fitment-industries": "https://www.fitmentindustries.com",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = affiliateLinks[slug];
  if (!url) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.redirect(url);
}
