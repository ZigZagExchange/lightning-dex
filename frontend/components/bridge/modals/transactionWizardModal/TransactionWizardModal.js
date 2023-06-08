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

function StageRow({ stage }) {
    const name = stage.completed ? <span style={{ color: 'green' }}>{stage.name}</span> :
        <span style={{ color: 'red' }}>
            {stage.name}
        </span>;
    return (
        <tr>
            <td>{name}</td>
            <td>{stage.completed ? <>✅</> : <>❌</>}</td>
        </tr>
    );
}

function StagesTable({ stages }) {
    const rows = [];

    stages.forEach((stage) => {
        rows.push(
            <StageRow
                stage={stage}
                key={stage.name} />
        );
    });

    return (
        <table style={{ color: 'black' }}>
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Completed</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

function UpdatingStagesTable({ stages }) {
    const [stageInfo, setStageInfo] = useState([])

    useEffect(() => {
        fetch('/api/hello')
            .then(response => response.json())
            .then(data => {
                setStageInfo(data)
            })
            .catch(error => console.error(error))
    }, []);

    return (
        <div>
            <StagesTable stages={stageInfo} />
        </div>
    );
}

export const TransactionWizardModal = (
    {
        handleClose,
        show,
        children
    }
) => {
    return (
        <ModalDiv block={show ? "block" : "none"}>
            <ContentDiv className="text-base font-medium text-white">
                {children}
                <UpdatingStagesTable stages={null}></UpdatingStagesTable>
                <button className={styles.connect_button}
                    onClick={handleClose}
                >
                    Close
                </button>
            </ContentDiv>
        </ModalDiv>
    )
}