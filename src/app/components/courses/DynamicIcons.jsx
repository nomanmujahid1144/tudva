"use client";

import * as FaIcons from "react-icons/fa";

const DynamicIcon = ({ iconName }) => {
  // Handle null or undefined iconName
  if (!iconName) {
    const DefaultIcon = FaIcons.FaBook;
    return <DefaultIcon size="5x" style={{width: '70%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />;
  }

  // Case 1: Handle FontAwesome icons format (icon:FaIconName)
  if (typeof iconName === 'string' && iconName.startsWith('icon:')) {
    const iconKey = iconName.substring(5); // Remove 'icon:' prefix
    const IconComponent = FaIcons[iconKey];
    
    if (IconComponent) {
      return <IconComponent size="5x" style={{width: '70%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />;
    }
  }
  
  // Case 2: Handle direct FontAwesome icon names
  if (typeof iconName === 'string' && iconName in FaIcons) {
    const IconComponent = FaIcons[iconName];
    return <IconComponent size="5x" style={{width: '70%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />;
  }

  // Case 3: Handle custom icon URLs - check if it's a URL path
  if (typeof iconName === 'string' && 
      (iconName.startsWith('/') || 
       iconName.startsWith('http') || 
       iconName.includes('.png') || 
       iconName.includes('.jpg') || 
       iconName.includes('.svg'))) {
    
    // Format the path correctly
    let iconPath = iconName;
    
    // If it doesn't start with http or /, add the /assets/custom-icons/ prefix
    if (!iconName.startsWith('/') && !iconName.startsWith('http')) {
      iconPath = `/assets/custom-icons/${iconName}`;
    } else if (!iconName.startsWith('http') && !iconName.includes('assets/custom-icons')) {
      // If it starts with / but doesn't include assets/custom-icons
      iconPath = `/assets/custom-icons${iconName.startsWith('/') ? iconName : '/' + iconName}`;
    }
    
    return (
      <img
        src={iconPath}
        alt="Course Icon"
        style={{ width: '70%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        onError={(e) => {
          // If the primary path fails, try fallback paths
          const fallbackPaths = [
            `/assets/custom-icons/${iconName}`,
            `/assets/all icons 96px/${iconName}`,
            `/assets/icons/${iconName}`,
            `/assets/${iconName}`
          ];
          
          // Get current src to avoid trying the same path again
          const currentSrc = e.target.src;
          const nextPath = fallbackPaths.find(path => !currentSrc.endsWith(path));
          
          if (nextPath) {
            e.target.src = nextPath;
          } else {
            // If all paths fail, use a default FontAwesome icon
            e.target.onerror = null;
            e.target.style.display = 'none';
            
            // Insert a FontAwesome icon
            const parentNode = e.target.parentNode;
            const defaultIcon = document.createElement('i');
            defaultIcon.className = 'fas fa-book fs-1 text-light';
            parentNode.appendChild(defaultIcon);
          }
        }}
      />
    );
  }

  // Default fallback
  const DefaultIcon = FaIcons.FaBook;
  return <DefaultIcon size="5x" className="w-25" />;
};

export default DynamicIcon;