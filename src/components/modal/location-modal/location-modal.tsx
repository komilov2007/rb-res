"use client";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import { IconTrashFilled } from "@tabler/icons-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLocationModal } from "./useLocationModal";
import ModalScreen from "@/components/modal/screen-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  LocationAddresses,
  LocationDetails,
  LocationMap,
  LocationSearch,
} from "./components";

const LocationModal = () => {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { state, actions, refs, status } = useLocationModal();

  const search = (inputClassName: string) => (
    <LocationSearch
      value={state.addressName}
      isSearching={state.isSearching}
      results={state.searchResults}
      inputClassName={inputClassName}
      onChange={actions.handleChangeSearch}
      onSearch={() => actions.handleSearchCenter()}
      onSelect={actions.handleSelectAddress}
    />
  );

  const map = (className: string, locationButtonClassName?: string) => (
    <LocationMap
      yandexKey={state.yandexKey}
      mapKey={state.mapRenderKey}
      mapState={state.mapState}
      className={className}
      locationButtonClassName={locationButtonClassName}
      onLoad={actions.handleLoad}
      onBoundsChange={actions.handleBoundsChange}
      onCurrentLocation={actions.handleUserCurrentLocation}
      setMapInstance={(instance) => {
        refs.mapInstanceRef.current = instance;
      }}
    />
  );

  const continueButton = (className: string) => (
    <Button
      type="button"
      variant="primary-solid"
      size="primaryWide"
      disabled={state.isResolving || !state.addressName.trim()}
      className={className}
      onClick={actions.handleOpenDetails}
    >
      {state.isResolving ? t("location_resolving") : t("continue")}
    </Button>
  );

  const detailsContent = (
    <LocationDetails
      isDesktop={isDesktop}
      addressName={state.addressName}
      addressTitle={state.addressTitle}
      comment={state.comment}
      entrance={state.entrance}
      floor={state.floor}
      room={state.room}
      isPending={status.isCreateAddressPending}
      isResolving={state.isResolving}
      onClose={actions.handleClose}
      onEdit={actions.handleBackToMap}
      onSubmit={actions.handleSubmit}
      setAddressTitle={actions.setAddressTitle}
      setComment={actions.setComment}
      setEntrance={actions.setEntrance}
      setFloor={actions.setFloor}
      setRoom={actions.setRoom}
    />
  );

  const addressesContent = (
    <LocationAddresses
      addresses={state.addresses}
      activeAddressId={state.activeAddressId}
      onClose={actions.handleClose}
      onAdd={actions.handleAddAddress}
      onEdit={actions.handleEditAddress}
      onSelect={actions.handleSelectSavedAddress}
    />
  );

  const desktopContent = (
    <div className="flex h-full w-full flex-col bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-black">
          {t("location_delivery_address_title")}
        </h2>
        <XButton
          size="lg"
          onClick={actions.handleClose}
          className="bg-gray10"
        />
      </div>
      <div className="mt-4">{search("h-10 rounded-xl bg-gray10")}</div>
      <div className="mt-4 h-[480px] overflow-hidden rounded-2xl">
        {map("h-[480px] w-full")}
      </div>
      <div className="mt-4">{continueButton("w-full")}</div>
    </div>
  );

  const mobileContent = (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-gray10">
      <div className="absolute left-4 right-4 top-4 z-[100000001] flex items-start gap-3">
        <XButton
          size="lg"
          onClick={actions.handleClose}
          className="mt-1 bg-white"
        />
        <div className="min-w-0 flex-1">
          {search("h-12 rounded-2xl bg-white")}
          {state.editingAddressId && (
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="icon-lg"
                onClick={actions.handleDeleteAddress}
                disabled={status.isCreateAddressPending}
                className="bg-red-500 text-white"
                aria-label={t("location_delete_address")}
              >
                <IconTrashFilled size={17} />
              </Button>
            </div>
          )}
        </div>
      </div>
      {map("h-dvh min-h-dvh w-full", "bottom-24")}
      {continueButton("absolute bottom-4 left-4 right-4 z-[100000001] w-auto")}
    </div>
  );

  if (isDesktop) {
    return (
      <>
        {/* Dismissing (Escape / overlay) goes through handleClose like the
            mobile X — a bare setLocationModal(false) left the screen and
            editing id behind, so the next plain open landed on the map
            and "Tasdiqlash" updated the previously edited address. */}
        <Dialog
          open={state.locationModal && !state.detailsModal}
          onOpenChange={(open) => !open && actions.handleClose()}
        >
          <DialogContent
            showCloseButton={false}
            className="h-[700px] min-w-200 max-w-none overflow-hidden rounded-2xl border-0 bg-white p-0"
          >
            {state.mapModal ? desktopContent : addressesContent}
          </DialogContent>
        </Dialog>
        <Dialog
          open={state.locationModal && state.detailsModal}
          onOpenChange={(open) => !open && actions.handleClose()}
        >
          <DialogContent
            showCloseButton={false}
            className="h-[450px] min-w-[610px] max-w-none overflow-hidden rounded-2xl border-0 bg-white p-0"
          >
            {detailsContent}
          </DialogContent>
        </Dialog>
      </>
    );
  }
  if (!state.locationModal) return null;
  return (
    <ModalScreen
      onClose={actions.handleClose}
      placement={state.mapModal ? "screen" : "bottom"}
      className={state.mapModal ? "gap-0 !p-0" : "gap-0 !max-h-none !overflow-hidden !p-0"}
    >
      {state.detailsModal
        ? detailsContent
        : state.mapModal
          ? mobileContent
          : addressesContent}
    </ModalScreen>
  );
};

export default LocationModal;

