import styles from "./TransactionWizardModal.module.scss"
import { styled } from "styled-components"
import { useEffect, useState } from "react"

const ModalDiv = styled.div`
    display: ${p => p.block && p.block};
    position: fixed;
    top: 0;
    left:0;
    width: 100%;
    height:100%;
    background: rgba(0,0,0,0.6)
`
const ContentDiv = styled.div`
    position: fixed;
    top: 50%;
    left:50%;
    width: 80%;
    height:auto;
    border-radius: 1rem;
    padding: 2rem;
    transform: translate(-50%, -50%);
    background: white;
`

function StagesTable({ isSent, isMined }) {

    return (
        <table style={{ color: 'black' }}>
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Completed</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Sent</td>
                    <td>{isSent ? <>✅</> : <>❌</>}</td>
                </tr>
                <tr>
                    <td>Mined</td>
                    <td>{isMined ? <>✅</> : <>❌</>}</td>
                </tr>
            </tbody>
        </table>
    );
}

export const TransactionWizardModal = (
    {
        isSent,
        isMined,
        handleClose,
        show,
        children
    }
) => {
    return (
        <ModalDiv block={show ? "block" : "none"}>
            <ContentDiv className="text-base font-medium text-white">
                {children}
                <StagesTable isSent={isSent} isMined={isMined}></StagesTable>
                <button className={styles.connect_button}
                    onClick={handleClose}
                >
                    Close
                </button>
            </ContentDiv>
        </ModalDiv>
    )
}