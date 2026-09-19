import { Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import { Map, YMaps } from "react-yandex-maps";
import type { MutableRefObject } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";

type BranchDialogProps = {
  branch: BranchProps | null;
  branchMapRef: MutableRefObject<BranchMapInstance | null>;
  branchMapApiRef: MutableRefObject<BranchYMapsApi | null>;
  onClose: () => void;
  onOpenDirections: (branch: BranchProps) => void;
  renderBranchPlacemark: (branch: BranchProps | null) => void;
};

const BranchDialog = ({
  branch,
  branchMapRef,
  branchMapApiRef,
  onClose,
  onOpenDirections,
  renderBranchPlacemark,
}: BranchDialogProps) => {
  const t = useTranslations();

  return (
    <Dialog
      open={Boolean(branch)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="hidden min-w-[590px] max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border-0 bg-white p-0 lg:block">
        {branch && (
          <div className="flex flex-col">
            <div className="flex flex-col gap-1 p-5">
              <h2 className="text-xl font-bold text-black">
                {branch.name}
              </h2>
              <p className="text-sm font-medium leading-5 text-gray220">
                {branch.address}
              </p>
              {branch.phone && (
                <a
                  href={`tel:${branch.phone}`}
                  className="mt-1 text-sm font-medium text-black"
                >
                  {branch.phone}
                </a>
              )}
            </div>
            <div className="branch-yandex-map relative h-[505px] w-full overflow-hidden bg-gray10">
              <style jsx global>{`
                .branch-yandex-map [class*="controls-pane"],
                .branch-yandex-map [class*="controls__toolbar"],
                .branch-yandex-map [class*="float-button"],
                .branch-yandex-map [class*="search"],
                .branch-yandex-map [class*="traffic"],
                .branch-yandex-map [class*="type-selector"],
                .branch-yandex-map [class*="fullscreen"],
                .branch-yandex-map [class*="ruler"],
                .branch-yandex-map [class*="geolocation"],
                .branch-yandex-map [class*="copyright"],
                .branch-yandex-map [class*="gototech"],
                .branch-yandex-map [class*="gotoymaps"],
                .branch-yandex-map [class*="scale"] {
                  display: none !important;
                }
              `}</style>
              <YMaps
                query={{
                  load: "Map,Placemark",
                  // @ts-expect-error react-yandex-maps types do not include Uzbek, but Yandex accepts it.
                  lang: YANDEX_LANG,
                  coordorder: "longlat",
                  apikey: YANDEX_KEYS[0],
                }}
              >
                <Map
                  onLoad={(api) => {
                    branchMapApiRef.current = api as BranchYMapsApi;
                    renderBranchPlacemark(branch);
                  }}
                  instanceRef={(instance) => {
                    branchMapRef.current =
                      (instance as BranchMapInstance | null) ?? null;
                    renderBranchPlacemark(branch);
                  }}
                  state={{
                    center: [branch.longitude, branch.latitude],
                    zoom: 16,
                  }}
                  defaultOptions={{
                    controls: ["zoomControl"],
                    suppressMapOpenBlock: true,
                  }}
                  options={{
                    controls: ["zoomControl"],
                    suppressMapOpenBlock: true,
                  }}
                  className="h-full w-full"
                />
              </YMaps>
              <button
                type="button"
                onClick={() => onOpenDirections(branch)}
                className="absolute bottom-4 left-1/2 z-20 flex h-10 w-[190px] -translate-x-1/2 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/60"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <Navigation size={14} strokeWidth={2.6} />
                </span>
                {t("home.header.directions")}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BranchDialog;
