<script setup>
import ProjectCard from '@/components/ProjectCard.vue'
</script>

<template>
  <div class="md:py-16">
    <ProjectCard
      class="text-gray-700 dark:text-neutral-200"
      v-for="(project, index) in project.items"
      :item="project"
      :key="index"></ProjectCard>
  </div>
</template>

<script>
import info from "@/info.json";

export default {
  name: "ProjectPage",
  metaInfo: {
    title: 'Projetos',
  },
  data() {
    return {
      project: info.project
    }
  },
  components: {
    ProjectCard,
  }
}
</script>

