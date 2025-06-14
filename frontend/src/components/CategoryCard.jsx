import { Link } from "react-router-dom"
import "../styles/category-card.css"

function CategoryCard({ category }) {
  return (
    <Link to={`#`} className="category-card">
      <div className="category-image">
        <img src={category.image || "/placeholder.svg"} alt={category.name} />
      </div>
      
      <h3 className="category-name">{category.name}</h3>
    </Link>
  )
}

export default CategoryCard

