export function DocumentCard({ title, description, doc}) {
//   const Icon = iconMap[iconType] || iconMap.default

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />
      
      <div className="relative">
                        <span className={`material-symbols-outlined ${doc.color || 'text-primary'} text-4xl mb-4`}>
                          {doc.icon || 'description'}
                        </span>
        
        <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
