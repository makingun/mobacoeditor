//@ts-ignore
const path = window.path;

export default class Path {

    public static relToAbs(currentPath: string, relativePath: string): string {
        return path.resolve(path.dirname(currentPath), relativePath);
    }

}
