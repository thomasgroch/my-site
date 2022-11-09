<script setup>
import ProjectCard from '@/components/ProjectCard.vue'
</script>

<template>
  <div class="md:py-16">
    <ProjectCard
      class="text-gray-700 dark:text-neutral-200"
      v-for="(project, index) in projects"
      :item="project"
      :key="index"></ProjectCard>
  </div>
</template>

<script>
import resume from "~/resume.json";

export default {
  name: "ProjectPage",
  metaInfo: {
    title: 'Projetos',
  },
  data() {
    return {
      projects: resume.work
    }
  },
  components: {
    ProjectCard,
  }
}
</script>

