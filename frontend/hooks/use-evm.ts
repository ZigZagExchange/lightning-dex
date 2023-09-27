import { useDebounce } from "use-debounce";
import {
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import {
  ETH_DEPOSIT_CONTRACT,
  ZKSYNC_DEPOSIT_CONTRACT,
  ZKSYNC_LITE_LIQUIDITY_POOL,
  ZZ_TOKEN_CONTRACT_ADDRESS_ON_ZKSYNC_ERA,
  depositContractABI,
} from "../data";
import { Assets } from "../contexts/bridge-context";
import { useEthersSigner } from "./use-ethers-signer";
import * as zksyncLite from "zksync";
import { useState } from "react";
import { ethers } from "ethers";

function useEvm(
  depositAmount: string,
  withdrawalAddress: string,
  outgoingAsset: Assets
) {
  const debouncedDepositAmount = useDebounce(
    depositAmount === "" || isNaN(Number(depositAmount)) ? "0" : depositAmount,
    500
  );
  const debouncedWithdrawAddress = useDebounce(withdrawalAddress, 500);
  const ethersSigner = useEthersSigner();
  const [isLoading, setIsLoading] = useState(false);

  // l1 eth
  const prepareL1EthDepositWrite = usePrepareContractWrite({
    address: ETH_DEPOSIT_CONTRACT,
    abi: depositContractABI,
    functionName: "depositETH",
    args: [outgoingAsset, debouncedWithdrawAddress[0]],
    value: ethers.utils.parseEther(
      debouncedDepositAmount[0] === "" ? "0" : debouncedDepositAmount[0]
    ) as any,
  });
  const l1EthDepositWrite = useContractWrite(prepareL1EthDepositWrite.config);
  const waitForL1EthDeposit = useWaitForTransaction({
    hash: l1EthDepositWrite.data?.hash,
    confirmations: 4,
  });

  // zksync era eth
  const prepareZkSyncEraEthDepositWrite = usePrepareContractWrite({
    address: ZKSYNC_DEPOSIT_CONTRACT,
    abi: depositContractABI,
    functionName: "depositETH",
    args: [outgoingAsset, debouncedWithdrawAddress[0]],
    value: ethers.utils.parseEther(
      debouncedDepositAmount[0] === "" ? "0" : debouncedDepositAmount[0]
    ) as any,
  });
  const zksyncEraEthDepositWrite = useContractWrite(
    prepareZkSyncEraEthDepositWrite.config
  );
  const waitForZksyncEraDeposit = useWaitForTransaction({
    hash: zksyncEraEthDepositWrite.data?.hash,
    confirmations: 4,
  });

  // zksync era zz tokens
  const prepareZksyncZZTokenDepositWrite = usePrepareContractWrite({
    address: ZKSYNC_DEPOSIT_CONTRACT,
    abi: depositContractABI,
    functionName: "depositERC20",
    args: [
      ZZ_TOKEN_CONTRACT_ADDRESS_ON_ZKSYNC_ERA,
      depositAmount[0],
      outgoingAsset,
      debouncedWithdrawAddress[0],
    ],
    value: 0 as any,
  });
  const zksyncEraZZTokenDepositWrite = useContractWrite(
    prepareZksyncZZTokenDepositWrite.config
  );
  const waitForZksyncEraZZTokenDeposit = useWaitForTransaction({
    hash: zksyncEraZZTokenDepositWrite.data?.hash,
    confirmations: 4,
  });

  // zksync lite eth
  const depositZksyncLiteEth = async () => {
    if (ethersSigner) {
      setIsLoading(true);
      const zksyncProvider = await zksyncLite.getDefaultProvider("mainnet");
      const zkSyncWallet = await zksyncLite.Wallet.fromEthSigner(
        ethersSigner,
        zksyncProvider
      );
      const depositTransaction = await zkSyncWallet.syncTransfer({
        to: ZKSYNC_LITE_LIQUIDITY_POOL,
        token: "ETH",
        amount: ethers.utils.parseEther(depositAmount),
      });
      await depositTransaction.awaitReceipt();
      setIsLoading(false);
    }
  };

  // zksync lite zz tokens
  const depositZksyncLiteZZTokens = async () => {
    if (ethersSigner) {
      setIsLoading(true);
      const zkSyncProvider = await zksyncLite.getDefaultProvider("mainnet");
      const zkSyncWallet = await zksyncLite.Wallet.fromEthSigner(
        ethersSigner,
        zkSyncProvider
      );

      const batchBuilder = await zkSyncWallet.batchBuilder();
      batchBuilder.addTransfer({
        to: ZKSYNC_LITE_LIQUIDITY_POOL,
        token: "ZZ",
        amount: ethers.utils.parseEther(depositAmount),
      });

      const txBatch = await batchBuilder.build("ETH");
      const batch = await Promise.all(
        txBatch.txs.map(async ({ tx }) => {
          const sig = await zkSyncWallet.signSyncTransfer(tx as any);
          return { tx, signature: sig.ethereumSignature };
        })
      );
      await zkSyncProvider.submitTxsBatch(batch);
      setIsLoading(false);
    }
  };

  const isEvmTxLoading =
    waitForL1EthDeposit.isLoading ||
    waitForZksyncEraDeposit.isLoading ||
    waitForZksyncEraZZTokenDeposit.isLoading ||
    isLoading;

  return {
    isEvmTxLoading,
    depositL1Eth: () => l1EthDepositWrite.write?.(),
    depositZksyncEraEth: () => zksyncEraEthDepositWrite.write?.(),
    depositZksyncZZTokens: () => zksyncEraZZTokenDepositWrite.write?.(),
    depositZksyncLiteEth,
    depositZksyncLiteZZTokens,
  };
}

export { useEvm };
