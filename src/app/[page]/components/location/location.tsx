import { useEffect } from "react";

import { BranchSelectionChip } from "@/components/branch-selection";
import { useAuthStore } from "@/stores/auth";
import { useLocationStore } from "@/stores/location";
import { useAddresses } from "@/hooks/useAddresses";

type LocationProps = {
  className?: string;
  labelClassName?: string;
};

// Header indicator of the current delivery/pickup choice (chip). Also keeps
// its original job of defaulting the location store to the user's current
// saved address.
const Location = ({ className, labelClassName }: LocationProps) => {
  const address = useLocationStore((state) => state.address);
  const setAddress = useLocationStore((state) => state.setAddress);
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const { data: addresses } = useAddresses(auth?.customer, hasAccess && Boolean(auth?.customer));
  const currentAddress =
    addresses?.data.find((item) => item.is_current) ?? addresses?.data[0];

  useEffect(() => {
    if (address || !currentAddress) return;

    setAddress(currentAddress.address, {
      id: currentAddress.id,
      latitude: currentAddress.latitude,
      longitude: currentAddress.longitude,
    });
  }, [address, currentAddress, setAddress]);

  return (
    <BranchSelectionChip className={className} labelClassName={labelClassName} />
  );
};

export default Location;
