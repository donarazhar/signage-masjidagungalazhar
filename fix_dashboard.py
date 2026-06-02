import re

with open('frontend/src/components/admin/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Delete Info Cards Row in Admin Dashboard
admin_end_marker = """      </div>
    );
  }

  // ======================"""
info_cards_start = "        {/* Info Cards Row */}"
start_idx = content.find(info_cards_start)
end_idx = content.find(admin_end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

# 2. Restructure Super Admin Dashboard Main Grid
super_admin_grid_start = """      {/* Main Grid - Template, Layout, Preview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >"""
super_admin_grid_replace = """      {/* Main Grid - Preview, Template, Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >"""
content = content.replace(super_admin_grid_start, super_admin_grid_replace)

# 3. Change Template Tampilan flex-col to grid 1 row
template_flex = """          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {Object.values(displayTemplates).map((tmpl) => {"""
template_grid = """          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}
          >
            {Object.values(displayTemplates).map((tmpl) => {"""
content = content.replace(template_flex, template_grid)

# 4. Change Layout Tampilan flex-col to grid 2 rows (3 cols since there are 6 layouts)
layout_flex = """          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {Object.values(displayLayouts).map((layout) => {"""
layout_grid = """          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}
          >
            {Object.values(displayLayouts).map((layout) => {"""
content = content.replace(layout_flex, layout_grid)

# 5. Move Preview Display to the top of the flex column.
preview_start = "        {/* Preview Display - Static (No Live Data) */}"
idx_preview = content.find(preview_start)
idx_end_main_grid = content.find("      </div>\n    </div>\n  );\n}")

if idx_preview != -1 and idx_end_main_grid != -1:
    preview_block = content[idx_preview:idx_end_main_grid]
    content = content[:idx_preview] + content[idx_end_main_grid:]
    
    idx_insert = content.find(super_admin_grid_replace) + len(super_admin_grid_replace) + 1
    content = content[:idx_insert] + preview_block + content[idx_insert:]

with open('frontend/src/components/admin/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard refactored successfully.")
