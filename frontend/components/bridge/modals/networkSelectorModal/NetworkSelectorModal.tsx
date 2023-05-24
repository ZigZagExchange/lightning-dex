import Image from "next/image"
import { useSwitchNetwork, useNetwork } from "wagmi"

import styles from "./NetWorkSelectorModal.module.scss"
import { styled } from "styled-components"
import { networksItems } from "../../../../utils/data"
import { useEffect, useState } from "react"


interface Props {
    close: () => void
}

const NetworkItem: any = styled.div`
  button{
    width: 100%;

    &:hover, &.active {
      background-color: ${(props: any) => props.color + "50"};
      border-color: ${(props: any) => props.color};
    }
  }
`

function NetworkSelectorModal({ close }: Props) {
    const { chain } = useNetwork()
    const { isLoading, switchNetwork } = useSwitchNetwork()
    const [isChanged, setIsChanged] = useState(false)

    useEffect(() => {
        if (isChanged && !isLoading) {
            close()
            setIsChanged(false)
        }
    }, [isLoading])

    const changeNetwork = (id: number) => {
        switchNetwork?.(id)
        setIsChanged(true)
    }

    return (
        <div className="border-0 rounded-lg relative flex flex-col w-full outline-none focus:outline-none">
            <div className="inline-block rounded-xl pt-2 px-6 pb-4 text-left overflow-hidden transform transition-all w-96 align-bottom sm:align-middle bg-bgLight">
                <div>
                    <div className="flex items-center pt-3">
                        <h3 className="pt-3" id="modal-headline">
                            <p className="mb-3 text-sm text-secondaryTextColor text-opacity-50 undefined">Select Network</p>
                        </h3>

                        <div className="ml-auto cursor-pointer" onClick={close}>
                            <div className="float-right text-sm text-red-500 hover:underline">Clear
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-400"></p>
                </div>

                <div className={`${styles.token_container} flex flex-col space-y-3 overflow-y-auto scrollbar-hide py-2 max-h-[80vh]`}>
                    {
                        networksItems.map((item, index) =>
                            <NetworkItem color={item.color} key={`${item.name} + ${index}`}>
                                <button
                                    className={`${chain?.id === item.id ? "active" : ""}  flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent`}
                                    onClick={() => changeNetwork(item.id)}
                                >
                                    <Image src={`/tokenIcons/${item.icon}`} alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                                    <div className="flex-col text-left">
                                        <div className="text-white ">{item.name}</div>
                                    </div>
                                </button>
                            </NetworkItem>
                        )}
                </div>
            </div>
        </div>
    )
}

export default NetworkSelectorModal