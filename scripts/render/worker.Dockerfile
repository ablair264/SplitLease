# Minimal headless Blender worker for GPU renders
# Use an NVIDIA CUDA base; ensure host runs with --gpus all (nvidia-container-runtime)
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y wget ca-certificates libxi6 libglu1-mesa libxrender1 libxrandr2 libfreetype6 libxfixes3 libxext6 libxxf86vm1 libsm6 && \
    rm -rf /var/lib/apt/lists/*

# Install Blender (portable)
ARG BLENDER_MAJOR=3.6
ARG BLENDER_VER=3.6.5
RUN wget -q https://download.blender.org/release/Blender${BLENDER_MAJOR}/blender-${BLENDER_VER}-linux-x64.tar.xz -O /tmp/blender.tar.xz && \
    cd /opt && tar xf /tmp/blender.tar.xz && \
    ln -s /opt/blender-${BLENDER_VER}-linux-x64/blender /usr/local/bin/blender && \
    rm /tmp/blender.tar.xz

WORKDIR /render
COPY render.py /render/

# Default command prints blender version
CMD ["blender", "-v"]

