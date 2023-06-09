import styles from "./TransactionWizardModal.module.scss"
import { styled } from "styled-components"

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

function StagesTable({ isSent, isMined, bridgeSent }) {

    return (
        <table style={{ color: 'black' }}>
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Completed</th>
                    <th>Hash</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Sent</td>
                    <td>{isSent ? <>✅</> : <>❌</>}</td>
                    <td>N/A</td>
                </tr>
                <tr>
                    <td>Mined</td>
                    <td>{isMined ? <>✅</> : <>❌</>}</td>
                    <td>{isMined.length > 2 ?
                        <a
                            href={`https://etherscan.io/tx/${isMined}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {isMined.slice(0, 6)}...{isMined.slice(-6)}
                        </a> : null}
                    </td>
                </tr>
                <tr>
                    <td>Funds Bridged</td>
                    <td>{bridgeSent ? <>✅</> : <>❌</>}</td>
                    <td>{bridgeSent ?
                        <a
                            href={`https://mempool.space/tx/${bridgeSent}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {bridgeSent.slice(0, 6)}...{bridgeSent.slice(-6)}
                        </a> : null}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export const TransactionWizardModal = (
    {
        isSent,
        isMined,
        bridgeSent,
        handleClose,
        show,
        children
    }
) => {
    return (
        <ModalDiv block={show ? "block" : "none"}>
            <ContentDiv className="text-base font-medium text-white">
                {children}
                <StagesTable isSent={isSent} isMined={isMined} bridgeSent={bridgeSent}></StagesTable>
                <button className={styles.connect_button}
                    onClick={handleClose}
                >
                    Close
                </button>
            </ContentDiv>
        </ModalDiv>
    )
}