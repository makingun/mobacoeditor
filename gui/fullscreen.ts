function toggleFullscreen(): void {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.body.requestFullscreen();
        //@ts-ignore
        screen.orientation.lock('landscape').catch((error: Error) => {
            alert('Error locking orientation: ' + error);
        });
    }
}
