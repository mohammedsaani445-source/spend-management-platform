import styles from "./Loader.module.css";

interface LoaderProps {
    text?: string;
    fullScreen?: boolean;
}

export default function Loader({ text = "LOADING...", fullScreen = false }: LoaderProps) {
    const loaderContent = (
        <div className={styles.loaderContainer}>
            <div className={styles.dotSpinner}>
                <div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div>
            </div>
            {text && <div className={styles.loaderText}>{text}</div>}
        </div>
    );

    if (fullScreen) {
        return <div className={styles.fullScreenWrapper}>{loaderContent}</div>;
    }

    return <div className={styles.wrapper}>{loaderContent}</div>;
}
