import React, { PropsWithChildren, useRef } from "react";
import styles from "./modal.module.css";

interface Props extends PropsWithChildren {
  isVisible: boolean;
  onClose: () => void;
  title: string;
}

function Modal({ children, isVisible, onClose, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className={`${styles.container} ${isVisible ? "" : styles.hidden}`}
      onClick={(e) => (e.target === containerRef.current ? onClose() : null)}
      ref={containerRef}
    >
      <div className={`${styles.modal} ${styles.wallet_modal}`}>
        <div className="rounded-lg relative flex flex-col w-full overflow-hidden outline-none focus:outline-none">
          <div
            className="inline-block px-6 pt-2 pb-4 overflow-hidden text-left align-bottom transition-all transform  rounded-lg shadow-xl sm:align-middle w-96 "
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div>
              <div className="flex items-center">
                <h3 className="pt-3" id="modal-headline">
                  <p className="mb-3 text-opacity-50 text-xl text-white font-bold">
                    {title}
                  </p>
                </h3>

                <div className="ml-auto cursor-pointer" onClick={onClose}>
                  <div className="float-right text-sm text-red-500 hover:underline">
                    Clear
                  </div>
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
