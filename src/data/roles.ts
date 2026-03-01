export type RoleSkills = {
  [skill: string]: number;
};

export type RolesType = {
  [role: string]: RoleSkills;
};

export const roles: RolesType = {
  "Data Scientist": {
    python: 0.9,
    ml: 1.0,
    statistics: 0.8,
    sql: 0.7,
  },
  "Backend Developer": {
    node: 1.0,
    database: 0.9,
    system_design: 0.8,
    docker: 0.7,
  },
  "Frontend Developer": {
    react: 1.0,
    javascript: 0.9,
    css: 0.8,
    typescript: 0.7,
  },
};
