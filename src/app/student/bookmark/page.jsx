import Bookmark from "./components/Bookmark";
import { Card, CardHeader } from "react-bootstrap";
export const metadata = {
  title: 'Bookmark'
};
const BookmarkPage = () => {
  return <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <h3 className="mb-0">WishList</h3>
      </CardHeader>
      <Bookmark />
    </Card>;
};
export default BookmarkPage;
