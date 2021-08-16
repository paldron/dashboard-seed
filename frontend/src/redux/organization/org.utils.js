
export const sortOrgStructure = structure => {
    return structure.departments
        .map(dept => {
            let sections = structure.sections.filter(section => section.department_id === dept.id);
            return {
                value: dept.id,
                label: dept.department,
                children: sections.map(section => ({
                   value: section.id,
                   label: section.section
                }))
            }
        });
}

export const sortOrgModules = modules => {
    return modules.map(mod => ({label: mod.module_name, value: mod.id}))
}